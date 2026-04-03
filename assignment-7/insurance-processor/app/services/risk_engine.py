from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple


SAFE_SEARCH_LEVELS = {
    "UNKNOWN": 0,
    "VERY_UNLIKELY": 1,
    "UNLIKELY": 2,
    "POSSIBLE": 3,
    "LIKELY": 4,
    "VERY_LIKELY": 5,
}


EXAGGERATION_KEYWORDS = [
    "total loss",
    "destroyed",
    "completely",
    "never",
    "worst",
    "no damage",
    "100%",
]


def _has_date(text: str) -> bool:
    if not text:
        return False
    # YYYY-MM-DD or DD/MM/YYYY or Month name formats
    return bool(
        re.search(r"\b(20\d{2})[-/\.](0?[1-9]|1[0-2])[-/\.](0?[1-9]|[12]\d|3[01])\b", text)
        or re.search(r"\b(0?[1-9]|[12]\d|3[01])[-/\.](0?[1-9]|1[0-2])[-/\.](20\d{2})\b", text)
        or re.search(
            r"\b(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?)\b",
            text,
            flags=re.IGNORECASE,
        )
    )


def _has_amount(text: str) -> bool:
    if not text:
        return False
    # Rough currency/amount detection
    return bool(
        re.search(r"(€|\$|£)\s?\d{1,3}(,\d{3})*(\.\d{2})?", text)
        or re.search(r"\b\d{2,}(\.\d{2})?\b", text)
    )


def _contains_exaggeration(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    return any(k in t for k in EXAGGERATION_KEYWORDS)


def _risk_level(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def calculate_risk_score(
    *,
    vision_labels: List[str],
    safe_search: Dict[str, Any],
    ocr_text: str,
    nlp_entities: List[Dict[str, Any]],
    sentiment: Dict[str, Any],
    translated_text: str,
    pii_entities: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Rule-based MVP scoring.

    This is NOT a real fraud model; it just demonstrates integration and a clear UI for Task 7.
    """
    score = 0
    flags: List[str] = []
    breakdown: Dict[str, int] = {}

    merged_text = "\n".join([ocr_text or "", translated_text or ""]).strip()

    # Safe search flags (adult/violence)
    adult = (safe_search or {}).get("adult")
    violence = (safe_search or {}).get("violence")
    medical = (safe_search or {}).get("medical")

    def safe_score(level: Any) -> int:
        if not isinstance(level, str):
            return 0
        return SAFE_SEARCH_LEVELS.get(level.upper(), 0)

    adult_s = safe_score(adult)
    violence_s = safe_score(violence)

    if adult_s >= 3:
        score += 10
        breakdown["safe_search_adult"] = 10
        flags.append(f"Safe-search adult likelihood: {adult}")
    if violence_s >= 3:
        score += 15
        breakdown["safe_search_violence"] = 15
        flags.append(f"Safe-search violence likelihood: {violence}")
    if medical:
        # medical flag is usually less meaningful for insurance fraud; keep minimal
        if safe_score(medical) >= 3:
            score += 5
            breakdown["safe_search_medical"] = 5
            flags.append(f"Safe-search medical likelihood: {medical}")

    # Sentiment: strong negative sentiment is often correlated with urgency/anger
    sent_score = sentiment.get("score")
    if isinstance(sent_score, (int, float)):
        if sent_score <= -0.2:
            score += 25
            breakdown["negative_sentiment"] = 25
            flags.append(f"Negative sentiment score: {sent_score}")
        elif sent_score <= -0.05:
            score += 10
            breakdown["slightly_negative_sentiment"] = 10
            flags.append(f"Slightly negative sentiment score: {sent_score}")

    # Exaggeration keywords in description/OCR
    if _contains_exaggeration(merged_text):
        score += 15
        breakdown["exaggeration_keywords"] = 15
        flags.append("Exaggeration keywords detected in text")

    # Document completeness
    if not _has_date(merged_text):
        score += 10
        breakdown["missing_date_signal"] = 10
        flags.append("No clear date found in OCR/text")
    if not _has_amount(merged_text):
        score += 10
        breakdown["missing_amount_signal"] = 10
        flags.append("No clear amount/currency found in OCR/text")

    # Entity mismatch (very rough demo check)
    # Example: if vision says 'bicycle' but entities include 'car', flag.
    labels_l = " ".join([l.lower() for l in (vision_labels or [])])
    ent_text = " ".join([e.get("name", "") for e in (nlp_entities or [])]).lower()
    mismatch_pairs = [
        ("car", "bicycle"),
        ("bicycle", "car"),
        ("motorcycle", "car"),
        ("truck", "car"),
    ]
    for a, b in mismatch_pairs:
        if a in labels_l and b in ent_text:
            score += 12
            breakdown["entity_mismatch"] = breakdown.get("entity_mismatch", 0) + 12
            flags.append(f"Possible mismatch: vision '{a}' vs text '{b}'")
            break

    # PII detection: show as a compliance/privacy flag
    if pii_entities:
        score += 5
        breakdown["pii_detected"] = 5
        flags.append(f"PII detected (privacy/compliance flag): {len(pii_entities)} entities")

    # Clamp to 0..100
    score = max(0, min(100, score))

    return {
        "score": score,
        "level": _risk_level(score),
        "flags": flags,
        "breakdown": breakdown,
    }

