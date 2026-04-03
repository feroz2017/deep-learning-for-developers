from __future__ import annotations

from typing import Any, Dict, Optional

import httpx


TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2"


async def google_translate_to_english(
    client: httpx.AsyncClient,
    api_key: str,
    text: str,
) -> Dict[str, Any]:
    """
    Translates text into English using Google Cloud Translation API v2.
    Detects source language automatically by omitting `source`.
    """
    if not text or not text.strip():
        return {"source_language": None, "translated_text": "", "raw": {}}

    params = {"key": api_key}
    payload = {"q": text, "target": "en", "format": "text"}

    resp = await client.post(TRANSLATE_URL, params=params, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    # `translations` item contains translatedText; detect from `detectedSourceLanguage` at top-level
    translations = data.get("data", {}).get("translations") or []
    translated = translations[0].get("translatedText") if translations else ""
    detected = translations[0].get("detectedSourceLanguage") if translations else None
    return {"source_language": detected, "translated_text": translated, "raw": data}

