from __future__ import annotations

import json
from typing import Any, Dict, List

import httpx


# ────────────────────────────────────────────────────────────────────────────
# Shared prompt builder
# ────────────────────────────────────────────────────────────────────────────

def _report_context(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Trim the analysis payload down to a compact context for the LLM."""
    return {
        "summary": payload.get("summary", {}),
        "risk": payload.get("risk", {}),
        "translation": payload.get("translation", {}),
        "document": {
            "ocr_text_length": (payload.get("document") or {}).get("ocr_text_length", 0),
            "ocr_preview": ((payload.get("document") or {}).get("ocr_text_preview") or "")[:600],
        },
        "text_analysis": {
            "sentiment": (payload.get("text_analysis") or {}).get("sentiment", {}),
            "top_entities": ((payload.get("text_analysis") or {}).get("entities") or [])[:12],
            "top_key_phrases": ((payload.get("text_analysis") or {}).get("key_phrases") or [])[:12],
            "pii_categories": list({
                p.get("category") for p in
                ((payload.get("text_analysis") or {}).get("pii_entities") or [])
                if p.get("category")
            }),
        },
        "damage": {
            "top_labels": ((payload.get("damage") or {}).get("google_labels") or [])[:20],
            "azure_captions": [
                c.get("caption") for c in
                ((payload.get("damage") or {}).get("azure_captions") or [])
                if c.get("caption")
            ],
            "safe_search": (payload.get("damage") or {}).get("google_safe_search", {}),
        },
    }


REPORT_SYSTEM_PROMPT = (
    "You are an insurance claims analyst assistant. "
    "You always respond using GitHub-flavoured Markdown with headings, bold, "
    "lists, and tables where appropriate. "
    "Be factual, concise, and cite only data present in the input. "
    "Do not provide legal advice."
)

REPORT_USER_TEMPLATE = """\
Generate a structured written insurance claim report from the analysis data below.

Use these **exact** sections (use ## level-2 headings):
1. Executive Summary
2. Damage Evidence From Images
3. Document Evidence (OCR)
4. Text & Language Analysis
5. Compliance & Privacy Notes
6. Recommended Next Actions for Adjuster
7. Final Recommendation

Rules:
- Mention the risk score and risk level prominently.
- Highlight any missing evidence or uncertainty.
- Keep each section concise — aim for 60-80 words per section.
- Do not include legal advice.

**Input data (JSON):**
```json
{context}
```
"""


def _build_user_message(payload: Dict[str, Any]) -> str:
    ctx = _report_context(payload)
    return REPORT_USER_TEMPLATE.format(context=json.dumps(ctx, ensure_ascii=False, indent=2))


# ────────────────────────────────────────────────────────────────────────────
# Google Gemini
# ────────────────────────────────────────────────────────────────────────────

async def generate_gemini_written_report(
    *,
    client: httpx.AsyncClient,
    api_key: str,
    payload: Dict[str, Any],
    model: str = "gemini-2.0-flash",
    max_retries: int = 2,
    max_output_tokens: int = 2000,
) -> Dict[str, Any]:
    """
    Generate a structured written claim report using Google Gemini.
    """
    url = (
        f"https://generativelanguage.googleapis.com/v1beta"
        f"/models/{model}:generateContent?key={api_key}"
    )
    user_message = _build_user_message(payload)

    body = {
        "contents": [{"parts": [{"text": user_message}]}],
        "systemInstruction": {"parts": [{"text": REPORT_SYSTEM_PROMPT}]},
        # Keep output small to reduce token quota usage.
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": max_output_tokens},
    }

    last_error: str | None = None
    import asyncio
    for attempt in range(max_retries + 1):
        resp = await client.post(url, json=body, timeout=90)

        if resp.status_code == 200:
            break

        # Retry common transient failures (429 rate-limit / quota delays, 5xx).
        if resp.status_code in (429, 500, 503) and attempt < max_retries:
            retry_after_raw = resp.headers.get("retry-after")
            try:
                retry_after = float(retry_after_raw) if retry_after_raw else 2 ** attempt
            except Exception:
                retry_after = 2 ** attempt
            # Cap the wait so we don't block forever.
            await asyncio.sleep(min(retry_after, 30))
            continue

        # Non-retryable or out of retries: return structured error.
        error_body: Dict[str, Any] = {}
        try:
            error_body = resp.json()
        except Exception:
            pass
        api_error = (error_body.get("error") or {})
        msg = api_error.get("message") or resp.text[:300]
        code = api_error.get("code") or str(resp.status_code)
        last_error = f"[{code}] {msg}"
        return {
            "enabled": True,
            "provider": "google",
            "model": model,
            "status": "error",
            "report_markdown": "",
            "error": last_error,
        }

    # If we broke out of the loop due to HTTP 200.
    data = resp.json()

    candidates: List[Dict[str, Any]] = data.get("candidates") or []
    text_out = ""
    if candidates:
        parts = (((candidates[0] or {}).get("content") or {}).get("parts") or [])
        text_out = "\n".join(p.get("text", "") for p in parts if p.get("text")).strip()

    usage = data.get("usageMetadata") or {}

    return {
        "enabled": True,
        "provider": "google",
        "model": model,
        "status": "ok" if text_out else "empty",
        "report_markdown": text_out,
        "error": None if text_out else "No text returned from model.",
        "usage": {
            "prompt_tokens": usage.get("promptTokenCount"),
            "completion_tokens": usage.get("candidatesTokenCount"),
            "total_tokens": usage.get("totalTokenCount"),
        },
    }
