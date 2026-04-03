from __future__ import annotations

from typing import Any, Dict, List, Tuple

import httpx


def _extract_entities(entities_resp: Dict[str, Any]) -> List[Dict[str, Any]]:
    entities_raw = (entities_resp.get("entities") or [])
    entities: List[Dict[str, Any]] = []
    for e in entities_raw:
        entities.append(
            {
                "name": e.get("name"),
                "type": e.get("type"),
                "salience": e.get("salience"),
                "metadata": e.get("metadata", {}),
            }
        )
    return entities


def _extract_sentiment(sentiment_resp: Dict[str, Any]) -> Dict[str, Any]:
    score = (sentiment_resp.get("documentSentiment") or {}).get("score")
    magnitude = (sentiment_resp.get("documentSentiment") or {}).get("magnitude")
    return {"score": score, "magnitude": magnitude, "raw": sentiment_resp}


async def google_nlp_entities_and_sentiment(
    client: httpx.AsyncClient,
    api_key: str,
    text: str,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Calls Google Natural Language REST APIs:
    - analyzeEntities
    - analyzeSentiment
    """
    if not text or not text.strip():
        return [], {"score": None, "magnitude": None, "raw": {}}

    base = "https://language.googleapis.com/v1/documents"
    entities_url = f"{base}:analyzeEntities?key={api_key}"
    sentiment_url = f"{base}:analyzeSentiment?key={api_key}"

    doc = {"type": "PLAIN_TEXT", "content": text}
    body = {"document": doc, "encodingType": "UTF8"}

    entities_resp = await client.post(entities_url, json=body, timeout=60)
    entities_resp.raise_for_status()

    sentiment_resp = await client.post(sentiment_url, json=body, timeout=60)
    sentiment_resp.raise_for_status()

    entities = _extract_entities(entities_resp.json())
    sentiment = _extract_sentiment(sentiment_resp.json())
    return entities, sentiment

