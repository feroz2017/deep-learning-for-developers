from __future__ import annotations

import base64
from typing import Any, Dict, List, Optional

import httpx


VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate"


def _to_b64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


async def google_vision_labels_objects_safe_search(
    client: httpx.AsyncClient,
    api_key: str,
    image_bytes: bytes,
) -> Dict[str, Any]:
    """
    Runs label detection + object localization + safe-search detection.
    """
    payload = {
        "requests": [
            {
                "image": {"content": _to_b64(image_bytes)},
                "features": [
                    {"type": "LABEL_DETECTION"},
                    {"type": "OBJECT_LOCALIZATION"},
                    {"type": "SAFE_SEARCH_DETECTION"},
                ],
            }
        ]
    }

    resp = await client.post(f"{VISION_ENDPOINT}?key={api_key}", json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    ann = (data.get("responses") or [{}])[0]

    labels_raw = (ann.get("labelAnnotations") or [])
    labels = [x.get("description") for x in labels_raw if x.get("description")]

    objects_raw = (ann.get("localizedObjectAnnotations") or [])
    objects: List[Dict[str, Any]] = []
    for obj in objects_raw:
        name = obj.get("name")
        score = obj.get("score")
        bbox = obj.get("boundingPoly", {}).get("normalizedVertices", [])
        objects.append({"name": name, "score": score, "bbox": bbox})

    safe = ann.get("safeSearchAnnotation") or {}

    return {"labels": labels, "objects": objects, "safe_search": safe}


async def google_vision_document_ocr(
    client: httpx.AsyncClient,
    api_key: str,
    image_bytes: bytes,
) -> Dict[str, Any]:
    """
    Runs OCR via DOCUMENT_TEXT_DETECTION for images.
    (For PDFs, this MVP converts pages to images first.)
    """
    payload = {
        "requests": [
            {
                "image": {"content": _to_b64(image_bytes)},
                "features": [{"type": "DOCUMENT_TEXT_DETECTION"}],
            }
        ]
    }

    resp = await client.post(f"{VISION_ENDPOINT}?key={api_key}", json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    ann = (data.get("responses") or [{}])[0]

    full_text = ann.get("fullTextAnnotation", {}).get("text")
    pages: Optional[List[Dict[str, Any]]] = ann.get("textAnnotations")  # mostly debug

    return {"ocr_text": full_text or "", "raw": {"textAnnotations": pages}}

