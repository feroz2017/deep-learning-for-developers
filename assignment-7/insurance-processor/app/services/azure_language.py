from __future__ import annotations

from typing import Any, Dict, List, Tuple

import httpx


API_VERSION = "2022-05-01"
ANALYZE_TEXT_URL = "/language/:analyze-text"


def _extract_key_phrases(data: Dict[str, Any]) -> List[str]:
    documents = data.get("results", {}).get("documents") or []
    if documents:
        return documents[0].get("keyPhrases") or []
    return []


def _extract_pii_entities(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    documents = data.get("results", {}).get("documents") or []
    if documents:
        doc = documents[0]
        return doc.get("entities") or []
    return []


async def azure_key_phrases_and_pii(
    client: httpx.AsyncClient,
    endpoint: str,
    key: str,
    text: str,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Calls Azure Language Service unified endpoint for:
    - KeyPhraseExtraction
    - PiiEntityRecognition

    If language is not English, you should translate upstream first.
    """
    if not text or not text.strip():
        return {"key_phrases": [], "pii_entities": [], "raw": {}}

    url = f"{endpoint}{ANALYZE_TEXT_URL}?api-version={API_VERSION}"
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/json",
    }

    base_input = {"documents": [{"id": "claim-1", "language": language, "text": text}]}

    key_phrases_payload = {
        "kind": "KeyPhraseExtraction",
        "parameters": {"modelVersion": "latest"},
        "analysisInput": base_input,
    }

    pii_payload = {
        "kind": "PiiEntityRecognition",
        "parameters": {"modelVersion": "latest"},
        "analysisInput": base_input,
    }

    key_resp = await client.post(url, headers=headers, json=key_phrases_payload, timeout=60)
    key_resp.raise_for_status()
    key_data = key_resp.json()

    pii_resp = await client.post(url, headers=headers, json=pii_payload, timeout=60)
    pii_resp.raise_for_status()
    pii_data = pii_resp.json()

    key_phrases = _extract_key_phrases(key_data)
    pii_entities = _extract_pii_entities(pii_data)

    return {
        "key_phrases": key_phrases,
        "pii_entities": pii_entities,
        "raw": {"key_phrases": key_data, "pii": pii_data},
    }

