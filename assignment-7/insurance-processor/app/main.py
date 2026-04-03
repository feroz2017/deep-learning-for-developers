from __future__ import annotations

import os
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from app.services.azure_language import azure_key_phrases_and_pii
from app.services.azure_vision import azure_image_caption_tags_objects
from app.services.google_nlp import google_nlp_entities_and_sentiment
from app.services.google_translate import google_translate_to_english
from app.services.google_vision import (
    google_vision_document_ocr,
    google_vision_labels_objects_safe_search,
)
from app.services.llm_report import generate_gemini_written_report
from app.services.risk_engine import calculate_risk_score
from app.utils.pdf_to_images import pdf_bytes_to_images


load_dotenv()

app = FastAPI(title="Insurance Claims Processor (MVP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="app/templates")


def _env(name: str) -> str:
    val = os.getenv(name)
    if not val:
        raise RuntimeError(f"Missing environment variable: {name}")
    return val


def _merge_safe_search(safe_searches: List[Dict[str, Any]]) -> Dict[str, Any]:
    levels = {
        "UNKNOWN": 0,
        "VERY_UNLIKELY": 1,
        "UNLIKELY": 2,
        "POSSIBLE": 3,
        "LIKELY": 4,
        "VERY_LIKELY": 5,
    }

    keys = ["adult", "violence", "medical"]
    merged: Dict[str, Any] = {}
    for k in keys:
        best_val = "UNKNOWN"
        best_score = -1
        for ss in safe_searches:
            val = (ss or {}).get(k) or "UNKNOWN"
            score = levels.get(str(val).upper(), 0)
            if score > best_score:
                best_score = score
                best_val = val
        merged[k] = best_val
    return merged


def _build_summary(
    *,
    azure_captions: List[Dict[str, Any]],
    translated_description: str,
    nlp_entities: List[Dict[str, Any]],
    sentiment: Dict[str, Any],
    ocr_text: str,
    pii_entities: List[Dict[str, Any]],
    risk: Dict[str, Any],
    key_phrases: List[str],
) -> Dict[str, Any]:
    """Build a human-readable claim summary from all analyzed data."""
    parts: List[str] = []

    captions = [c.get("caption") for c in azure_captions if c.get("caption")]
    if captions:
        parts.append("Images show: " + "; ".join(captions) + ".")

    locations = [e["name"] for e in nlp_entities if e.get("type") == "LOCATION"][:3]
    if locations:
        parts.append("Locations mentioned: " + ", ".join(locations) + ".")

    persons = [e["name"] for e in nlp_entities if e.get("type") == "PERSON"][:3]
    orgs = [e["name"] for e in nlp_entities if e.get("type") == "ORGANIZATION"][:3]
    if persons:
        parts.append("People: " + ", ".join(persons) + ".")
    if orgs:
        parts.append("Organizations: " + ", ".join(orgs) + ".")

    pii_cats = list(set(p.get("category", "") for p in pii_entities if p.get("category")))
    if pii_cats:
        parts.append(f"PII categories found: {', '.join(pii_cats)}.")

    s = sentiment.get("score")
    if s is not None:
        tone = "negative" if s <= -0.2 else ("neutral" if s <= 0.2 else "positive")
        parts.append(f"Overall tone: {tone} (score {s}).")

    parts.append(f"Risk level: {risk.get('level', 'N/A')} ({risk.get('score', 0)}/100).")

    return {
        "text": " ".join(parts),
        "image_count": len(azure_captions),
        "ocr_chars": len(ocr_text),
        "entity_count": len(nlp_entities),
        "pii_count": len(pii_entities),
        "keyphrase_count": len(key_phrases),
    }


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze_claim(
    request: Request,
    images: List[UploadFile] = File(default=[]),
    documents: List[UploadFile] = File(default=[]),
    description: str = Form(default=""),
):
    t0 = time.time()
    services_called: List[Dict[str, Any]] = []

    try:
        google_vision_key = _env("GOOGLE_VISION_API_KEY")
        google_nlp_key = _env("GOOGLE_NLP_API_KEY")
        google_translate_key = _env("GOOGLE_TRANSLATE_API_KEY")

        azure_vision_endpoint = _env("AZURE_VISION_ENDPOINT")
        azure_vision_key = _env("AZURE_VISION_KEY")

        azure_language_endpoint = _env("AZURE_LANGUAGE_ENDPOINT")
        azure_language_key = _env("AZURE_LANGUAGE_KEY")

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not images and not documents and not (description or "").strip():
        raise HTTPException(status_code=400, detail="Upload at least one image/document or provide a description.")

    all_labels: List[str] = []
    all_objects: List[Dict[str, Any]] = []
    safe_searches: List[Dict[str, Any]] = []

    per_image: List[Dict[str, Any]] = []
    azure_captions: List[Dict[str, Any]] = []
    azure_tags: List[str] = []

    ocr_texts: List[str] = []

    translated_description = ""
    translated_source_lang: Optional[str] = None

    response_payload: Dict[str, Any] = {}
    service_errors: List[Dict[str, str]] = []   # non-fatal errors collected per run

    def _svc_err(name: str, provider: str, exc: Exception, ts: float) -> None:
        """Record a failed service call without crashing the request."""
        services_called.append({
            "name": name,
            "provider": provider,
            "duration_ms": int((time.time() - ts) * 1000),
            "error": f"{type(exc).__name__}: {exc}",
        })
        service_errors.append({"service": name, "error": str(exc)})

    try:
      async with httpx.AsyncClient() as client:
        for idx, img in enumerate(images or []):
            img_bytes = await img.read()
            img_result: Dict[str, Any] = {"filename": img.filename, "index": idx}

            # ── Google Vision: labels, objects, safe-search ──────────────────
            ts = time.time()
            try:
                google_res = await google_vision_labels_objects_safe_search(
                    client=client,
                    api_key=google_vision_key,
                    image_bytes=img_bytes,
                )
                services_called.append({"name": "Google Vision API", "provider": "google", "duration_ms": int((time.time() - ts) * 1000)})
            except Exception as exc:
                _svc_err("Google Vision API", "google", exc, ts)
                google_res = {}

            img_labels = google_res.get("labels") or []
            img_objects = google_res.get("objects") or []
            img_safe = google_res.get("safe_search") or {}

            all_labels.extend(img_labels)
            all_objects.extend(img_objects)
            safe_searches.append(img_safe)

            img_result["google_labels"] = img_labels
            img_result["google_objects"] = [{"name": o["name"], "score": o.get("score")} for o in img_objects]
            img_result["google_safe_search"] = img_safe

            # ── Azure Computer Vision: caption, tags, objects ────────────────
            ts = time.time()
            try:
                azure_res = azure_image_caption_tags_objects(
                    endpoint=azure_vision_endpoint,
                    key=azure_vision_key,
                    image_bytes=img_bytes,
                    language="en",
                )
                caption_entry = {
                    "caption": azure_res.get("caption"),
                    "tags": azure_res.get("tags") or [],
                    "objects": azure_res.get("objects") or [],
                }
                azure_captions.append(caption_entry)
                azure_tags.extend(azure_res.get("tags") or [])
                img_result["azure_caption"] = azure_res.get("caption")
                img_result["azure_tags"] = azure_res.get("tags") or []
                img_result["azure_objects"] = azure_res.get("objects") or []
                services_called.append({"name": "Azure Computer Vision", "provider": "azure", "duration_ms": int((time.time() - ts) * 1000)})
            except Exception as exc:
                _svc_err("Azure Computer Vision", "azure", exc, ts)
                azure_captions.append({"caption": None, "error": str(exc)})
                img_result["azure_error"] = str(exc)

            # ── Google Vision OCR on image (optional — best-effort) ──────────
            try:
                ocr_res = await google_vision_document_ocr(
                    client=client,
                    api_key=google_vision_key,
                    image_bytes=img_bytes,
                )
                txt = ocr_res.get("ocr_text") or ""
                if txt.strip():
                    ocr_texts.append(txt)
                    img_result["ocr_snippet"] = txt[:200]
            except Exception:
                pass  # OCR on photos is best-effort; silent skip is fine

            per_image.append(img_result)

        # ── Documents ────────────────────────────────────────────────────────
        for doc in documents or []:
            doc_bytes = await doc.read()
            filename = (doc.filename or "").lower()

            if "pdf" in filename or (doc.content_type and "pdf" in doc.content_type):
                max_pages = int(os.getenv("MAX_PDF_PAGES") or "3")
                try:
                    page_images = pdf_bytes_to_images(pdf_bytes=doc_bytes, max_pages=max_pages)
                except Exception as exc:
                    service_errors.append({"service": "PDF conversion", "error": str(exc)})
                    page_images = []

                for page_img_bytes, _mime in page_images:
                    ts = time.time()
                    try:
                        ocr_res = await google_vision_document_ocr(
                            client=client,
                            api_key=google_vision_key,
                            image_bytes=page_img_bytes,
                        )
                        services_called.append({"name": "Google Vision OCR", "provider": "google", "duration_ms": int((time.time() - ts) * 1000)})
                        txt = ocr_res.get("ocr_text") or ""
                        if txt.strip():
                            ocr_texts.append(txt)
                    except Exception as exc:
                        _svc_err("Google Vision OCR", "google", exc, ts)
            else:
                ts = time.time()
                try:
                    ocr_res = await google_vision_document_ocr(
                        client=client,
                        api_key=google_vision_key,
                        image_bytes=doc_bytes,
                    )
                    services_called.append({"name": "Google Vision OCR", "provider": "google", "duration_ms": int((time.time() - ts) * 1000)})
                    txt = ocr_res.get("ocr_text") or ""
                    if txt.strip():
                        ocr_texts.append(txt)
                except Exception as exc:
                    _svc_err("Google Vision OCR", "google", exc, ts)

        merged_ocr_text = "\n".join(ocr_texts).strip()[:8000]

        # ── Google Translate ─────────────────────────────────────────────────
        description = (description or "").strip()
        if description:
            ts = time.time()
            try:
                tr = await google_translate_to_english(
                    client=client,
                    api_key=google_translate_key,
                    text=description[:3000],
                )
                services_called.append({"name": "Google Translation API", "provider": "google", "duration_ms": int((time.time() - ts) * 1000)})
                translated_description = tr.get("translated_text") or description
                translated_source_lang = tr.get("source_language")
            except Exception as exc:
                _svc_err("Google Translation API", "google", exc, ts)
                translated_description = description  # fallback: use original text
                translated_source_lang = None
        else:
            translated_description = ""

        merged_for_analysis = "\n".join([translated_description, merged_ocr_text]).strip()[:5000]

        # ── Google Natural Language ──────────────────────────────────────────
        ts = time.time()
        try:
            nlp_entities, sentiment = await google_nlp_entities_and_sentiment(
                client=client,
                api_key=google_nlp_key,
                text=merged_for_analysis,
            )
            services_called.append({"name": "Google Natural Language API", "provider": "google", "duration_ms": int((time.time() - ts) * 1000)})
        except Exception as exc:
            _svc_err("Google Natural Language API", "google", exc, ts)
            nlp_entities, sentiment = [], {"score": None, "magnitude": None}

        # ── Azure Language ───────────────────────────────────────────────────
        ts = time.time()
        try:
            azure_language = await azure_key_phrases_and_pii(
                client=client,
                endpoint=azure_language_endpoint,
                key=azure_language_key,
                text=merged_for_analysis,
                language="en",
            )
            services_called.append({"name": "Azure Language Service", "provider": "azure", "duration_ms": int((time.time() - ts) * 1000)})
        except Exception as exc:
            _svc_err("Azure Language Service", "azure", exc, ts)
            azure_language = {"key_phrases": [], "pii_entities": []}

        safe_search_merged = _merge_safe_search(safe_searches)
        key_phrases = azure_language.get("key_phrases") or []
        pii_entities = azure_language.get("pii_entities") or []

        risk = calculate_risk_score(
            vision_labels=list(set(all_labels)),
            safe_search=safe_search_merged,
            ocr_text=merged_ocr_text,
            nlp_entities=nlp_entities,
            sentiment=sentiment,
            translated_text=merged_for_analysis,
            pii_entities=pii_entities,
        )

        summary = _build_summary(
            azure_captions=azure_captions,
            translated_description=translated_description,
            nlp_entities=nlp_entities,
            sentiment=sentiment,
            ocr_text=merged_ocr_text,
            pii_entities=pii_entities,
            risk=risk,
            key_phrases=key_phrases,
        )

        response_payload = {
            "summary": summary,
            "translation": {
                "source_language": translated_source_lang,
                "translated_description": translated_description,
            },
            "damage": {
                "google_labels": list(set(all_labels))[:200],
                "google_objects": all_objects[:200],
                "google_safe_search": safe_search_merged,
                "azure_captions": azure_captions,
                "azure_tags": list(set(azure_tags))[:200],
                "per_image": per_image,
            },
            "document": {
                "ocr_text_preview": merged_ocr_text[:2000],
                "ocr_text_length": len(merged_ocr_text),
            },
            "text_analysis": {
                "entities": nlp_entities[:50],
                "sentiment": {"score": sentiment.get("score"), "magnitude": sentiment.get("magnitude")},
                "key_phrases": key_phrases[:50],
                "pii_entities": pii_entities[:50],
            },
            "risk": risk,
        }

        # ── LLM written report: Google Gemini ────────────────────────────────
        gemini_api_key = os.getenv("GOOGLE_GEMINI_API_KEY", "").strip()
        gemini_model   = os.getenv("GOOGLE_GEMINI_MODEL", "gemini-2.0-flash").strip()
        gemini_fallback_model = os.getenv("GOOGLE_GEMINI_FALLBACK_MODEL", "gemini-flash-latest").strip()

        written_report: Dict[str, Any]

        if gemini_api_key:
            # Try primary model first. If it's quota-limited on free tier, retry with a cheaper/available fallback model.
            try:
                ts = time.time()
                written_report = await generate_gemini_written_report(
                    client=client,
                    api_key=gemini_api_key,
                    payload=response_payload,
                    model=gemini_model,
                )
                services_called.append(
                    {
                        "name": f"Google Gemini ({written_report.get('model', gemini_model)})",
                        "provider": "google",
                        "duration_ms": int((time.time() - ts) * 1000),
                    }
                )
            except Exception as e:
                written_report = {
                    "enabled": True,
                    "provider": "google",
                    "model": gemini_model,
                    "status": "error",
                    "report_markdown": "",
                    "error": str(e),
                }

            err_text = (written_report.get("error") or "") if isinstance(written_report, dict) else ""
            is_quota_free_tier = ("Quota exceeded" in err_text) or ("free_tier" in err_text)
            if (
                written_report.get("status") == "error"
                and written_report.get("provider") == "google"
                and is_quota_free_tier
                and gemini_fallback_model
                and gemini_fallback_model != gemini_model
            ):
                try:
                    ts2 = time.time()
                    written_report = await generate_gemini_written_report(
                        client=client,
                        api_key=gemini_api_key,
                        payload=response_payload,
                        model=gemini_fallback_model,
                    )
                    services_called.append(
                        {
                            "name": f"Google Gemini (fallback: {gemini_fallback_model})",
                            "provider": "google",
                            "duration_ms": int((time.time() - ts2) * 1000),
                        }
                    )
                except Exception as e:
                    written_report = {
                        "enabled": True,
                        "provider": "google",
                        "model": gemini_fallback_model,
                        "status": "error",
                        "report_markdown": "",
                        "error": str(e),
                    }
        else:
            written_report = {
                "enabled": False,
                "provider": None,
                "model": None,
                "status": "disabled",
                "report_markdown": "",
                "error": (
                    "No LLM configured. Set GOOGLE_GEMINI_API_KEY in .env."
                ),
            }

        response_payload["written_report"] = written_report

    except Exception as exc:
        # Absolute last-resort catch — return a clean JSON 500, not an ASGI crash
        total_ms = int((time.time() - t0) * 1000)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Analysis failed due to an unexpected error.",
                "detail": f"{type(exc).__name__}: {exc}",
                "services_called": services_called,
                "service_errors": service_errors,
                "meta": {"total_duration_ms": total_ms},
            },
        )

    total_ms = int((time.time() - t0) * 1000)
    response_payload["meta"] = {
        "total_duration_ms": total_ms,
        "services_called": services_called,
        "images_processed": len(per_image),
        "documents_processed": len(documents or []),
        "service_errors": service_errors,   # empty list when all succeeded
    }
    return JSONResponse(response_payload)

