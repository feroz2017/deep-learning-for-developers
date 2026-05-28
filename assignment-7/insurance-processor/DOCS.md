# AI Insurance Claims Processor — Full Technical Documentation

> A FastAPI prototype that feeds an insurance claim (images + documents + description) through
> seven AI/cloud cognitive services and returns a unified JSON analysis with a risk score and a
> Gemini-written adjuster report.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [How to Run](#3-how-to-run)
4. [End-to-End Flow](#4-end-to-end-flow)
5. [Service 1 — Google Vision: Labels, Objects & Safe Search](#5-service-1--google-vision-labels-objects--safe-search)
6. [Service 2 — Google Vision: Document OCR](#6-service-2--google-vision-document-ocr)
7. [Service 3 — Azure Computer Vision: Caption, Tags & Objects](#7-service-3--azure-computer-vision-caption-tags--objects)
8. [Service 4 — Google Translate](#8-service-4--google-translate)
9. [Service 5 — Google Natural Language API](#9-service-5--google-natural-language-api)
10. [Service 6 — Azure Language Service](#10-service-6--azure-language-service)
11. [Service 7 — Google Gemini (LLM Written Report)](#11-service-7--google-gemini-llm-written-report)
12. [Risk Engine (Custom Python)](#12-risk-engine-custom-python)
13. [Full API Response Structure](#13-full-api-response-structure)
14. [Environment Variables Reference](#14-environment-variables-reference)

---

## 1. Project Overview

The system takes a multimodal insurance claim submission:

- **Images** — photos of damage (car crash, flood, fire, etc.)
- **Documents** — scanned PDFs or image-based documents (policy sheets, receipts, repair quotes)
- **Description** — free-text written by the claimant (any language)

It runs all of this through a pipeline of cloud AI services and returns a single JSON response containing:

| Output | Source |
|---|---|
| Damage labels & detected objects | Google Vision |
| Safety flags (adult/violence content) | Google Vision Safe Search |
| All readable text extracted from images/docs | Google Vision OCR |
| Human-readable scene description ("a damaged silver car…") | Azure Computer Vision |
| Description translated to English | Google Translate |
| Named entities (people, places, organizations, dates) | Google NLP |
| Sentiment score of the claim text | Google NLP |
| Key phrases summarizing the claim | Azure Language |
| PII detection (names, phone numbers, ID numbers) | Azure Language |
| Fraud risk score (0–100) with flags | Custom Risk Engine |
| Full adjuster report in Markdown | Google Gemini |

---

## 2. Project Structure

```
insurance-processor/
├── app/
│   ├── main.py                        # FastAPI app, /api/analyze endpoint
│   ├── services/
│   │   ├── google_vision.py           # Labels + SafeSearch + OCR
│   │   ├── azure_vision.py            # Caption + Tags + Objects
│   │   ├── google_translate.py        # Auto-detect & translate to English
│   │   ├── google_nlp.py              # Entities + Sentiment
│   │   ├── azure_language.py          # Key Phrases + PII
│   │   ├── llm_report.py              # Gemini written report
│   │   └── risk_engine.py             # Custom rule-based risk scoring
│   ├── utils/
│   │   └── pdf_to_images.py           # PDF → JPEG pages (PyMuPDF)
│   └── templates/
│       └── index.html                 # Web UI
├── .env                               # Your API keys (never commit this)
├── .env.example                       # Template — copy to .env
└── requirements.txt
```

---

## 3. How to Run

### Step 1 — Clone & install dependencies

```bash
cd assignment-7/insurance-processor
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2 — Set up your API keys

```bash
cp .env.example .env
```

Open `.env` and fill in all keys (see [Section 14](#14-environment-variables-reference) for what each key is and where to get it).

### Step 3 — Start the server

```bash
uvicorn app.main:app --reload --port 8000
```

### Step 4 — Use the app

- **Web UI**: open `http://localhost:8000` in your browser
- **API directly**: `POST http://localhost:8000/api/analyze`
- **Health check**: `GET http://localhost:8000/health`

### Sending a request via curl

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "description=My car was hit from behind at the parking lot" \
  -F "images=@/path/to/damage_photo.jpg" \
  -F "documents=@/path/to/repair_quote.pdf"
```

---

## 4. End-to-End Flow

Below is the step-by-step order in which the services are called inside `app/main.py`:

```
User submits:  images[] + documents[] + description (text)
                              │
              ┌───────────────┼────────────────────┐
              │               │                    │
     For each IMAGE:    For each DOCUMENT:   description
              │               │                    │
    ① Google Vision    PDF → images (PyMuPDF)      │
      Labels/Objects/         │                    │
      SafeSearch      ② Google Vision OCR   ④ Google Translate
              │               │                    │
    ③ Azure Vision     merge all OCR text           │
      Caption/Tags/                                │
      Objects                                      │
              │                                    │
              └──────── merge_for_analysis ─────────┘
                        (translated_description + merged_ocr_text)
                                    │
                        ┌───────────┴──────────────┐
                        │                          │
              ⑤ Google NLP                ⑥ Azure Language
              Entities + Sentiment        Key Phrases + PII
                        │                          │
                        └───────────┬──────────────┘
                                    │
                          ⑦ Risk Engine (local Python)
                          Weighted rule-based scoring
                                    │
                          ⑧ Google Gemini
                          Written adjuster report (Markdown)
                                    │
                            JSON response to caller
```

---

## 5. Service 1 — Google Vision: Labels, Objects & Safe Search

**File:** `app/services/google_vision.py` → `google_vision_labels_objects_safe_search()`

**API:** Google Cloud Vision REST API — `https://vision.googleapis.com/v1/images:annotate`

### What goes in

| Input | Type | Description |
|---|---|---|
| `image_bytes` | `bytes` | Raw bytes of the uploaded image file |
| `api_key` | `str` | Google Cloud API key |

The image is base64-encoded and sent as a JSON body. **Three features are requested in a single API call:**

```python
"features": [
    {"type": "LABEL_DETECTION"},       # What is this image generally about?
    {"type": "OBJECT_LOCALIZATION"},   # What specific objects are in the image?
    {"type": "SAFE_SEARCH_DETECTION"}, # Is there adult/violent/medical content?
]
```

### What comes out

```python
{
    "labels": ["Car", "Vehicle", "Road", "Automotive lighting"],
    "objects": [
        {
            "name": "Car",
            "score": 0.94,
            "bbox": [{"x": 0.1, "y": 0.2}, ...]  # normalised 0.0–1.0 coordinates
        }
    ],
    "safe_search": {
        "adult": "VERY_UNLIKELY",
        "violence": "UNLIKELY",
        "medical": "VERY_UNLIKELY"
    }
}
```

### Why it's used

- **Labels** tell the risk engine what category of claim this is (car, bicycle, building, etc.)
- **Objects** + bounding boxes confirm physical damage evidence
- **Safe Search** catches fraudulent or unrelated content (e.g., submitting an adult image instead of damage photos)
- Safe Search levels (`UNKNOWN` → `VERY_UNLIKELY` → `UNLIKELY` → `POSSIBLE` → `LIKELY` → `VERY_LIKELY`) are mapped to a numeric scale 0–5 inside the risk engine

---

## 6. Service 2 — Google Vision: Document OCR

**File:** `app/services/google_vision.py` → `google_vision_document_ocr()`

**API:** Same endpoint as Service 1, but with `DOCUMENT_TEXT_DETECTION` feature.

### What goes in

| Input | Type | Description |
|---|---|---|
| `image_bytes` | `bytes` | Either an uploaded image, or a JPEG-rendered page from a PDF |
| `api_key` | `str` | Google Cloud API key |

**For PDF documents:** the file is first converted to individual page images using PyMuPDF (`app/utils/pdf_to_images.py`) at 200 DPI, then each page image is passed here separately.

```python
# pdf_to_images.py — converts PDF bytes to JPEG page images
doc = fitz.open(stream=pdf_bytes, filetype="pdf")
page = doc.load_page(page_index)
pix = page.get_pixmap(matrix=fitz.Matrix(200/72, 200/72), alpha=False)
```

### What comes out

```python
{
    "ocr_text": "REPAIR ESTIMATE\nDate: 12/03/2024\nVehicle: Toyota Corolla 2019\nTotal: €2,450.00\n..."
}
```

`DOCUMENT_TEXT_DETECTION` (vs the simpler `TEXT_DETECTION`) is used because it understands **document layout** — tables, columns, paragraphs — not just isolated words.

All OCR results from all images and all PDF pages are merged into one string:

```python
merged_ocr_text = "\n".join(ocr_texts).strip()[:8000]  # capped at 8000 chars
```

### Why it's used

The extracted text feeds into:
- Google NLP for entity/sentiment analysis
- Azure Language for key phrases and PII
- The risk engine (looks for dates, amounts, exaggeration keywords)
- Gemini's report as "document evidence"

---

## 7. Service 3 — Azure Computer Vision: Caption, Tags & Objects

**File:** `app/services/azure_vision.py` → `azure_image_caption_tags_objects()`

**SDK:** `azure-ai-vision-imageanalysis` (official Microsoft SDK — not raw HTTP)

### What goes in

| Input | Type | Description |
|---|---|---|
| `image_bytes` | `bytes` | Raw bytes of the uploaded image |
| `endpoint` | `str` | Your Azure resource URL (e.g. `https://myresource.cognitiveservices.azure.com`) |
| `key` | `str` | Azure Computer Vision API key |

Three visual features are requested:

```python
visual_features = [
    VisualFeatures.CAPTION,   # Single human-readable sentence describing the image
    VisualFeatures.TAGS,      # Keyword tags (broader than objects)
    VisualFeatures.OBJECTS,   # Detected objects with bounding boxes
]
```

### What comes out

```python
{
    "caption": "a damaged silver car on the side of a road",
    "tags": ["car", "outdoor", "vehicle", "road", "damaged", "accident"],
    "objects": [
        {
            "name": "Car",
            "confidence": 0.91,
            "bounding_box": {"x": 120, "y": 80, "width": 400, "height": 250}
        }
    ]
}
```

### Why it's used

- The **caption** is unique — Google Vision has no equivalent. It produces a single natural-language description that Gemini uses directly in the written report ("Images show: a damaged silver car on the side of a road")
- The **tags** supplement Google's labels for a broader vocabulary
- Azure uses pixel-coordinate bounding boxes while Google uses normalised 0.0–1.0 coordinates — both are preserved in the response

> **Note:** The Azure SDK call is synchronous (blocking). This is a known limitation — it runs inside the async FastAPI event loop without `asyncio.to_thread()`. For production, this should be wrapped.

---

## 8. Service 4 — Google Translate

**File:** `app/services/google_translate.py` → `google_translate_to_english()`

**API:** `https://translation.googleapis.com/language/translate/v2`

### What goes in

| Input | Type | Description |
|---|---|---|
| `text` | `str` | The claimant's description (any language), capped at 3000 chars |
| `api_key` | `str` | Google Cloud API key |

```python
payload = {"q": text, "target": "en", "format": "text"}
# No `source` field = automatic language detection
```

### What comes out

```python
{
    "source_language": "fi",             # ISO 639-1 code of detected language
    "translated_text": "My car was rear-ended at the intersection near the shopping centre.",
    "raw": { ... }                       # Full API response (kept for debugging)
}
```

If the description is already in English, it is still passed through — the API returns it unchanged with `source_language: "en"`.

### Why it's used

All downstream text analysis (Google NLP, Azure Language, Risk Engine) works best on English text. By translating first, the system handles claims in **any language** — Finnish, Arabic, German, etc. — without needing separate language models for each.

The translated text is merged with the OCR text to form `merged_for_analysis`:

```python
merged_for_analysis = "\n".join([translated_description, merged_ocr_text]).strip()[:5000]
```

---

## 9. Service 5 — Google Natural Language API

**File:** `app/services/google_nlp.py` → `google_nlp_entities_and_sentiment()`

**API:** `https://language.googleapis.com/v1/documents`

Two separate REST calls are made with the same input text:

### What goes in

| Input | Type | Description |
|---|---|---|
| `text` | `str` | `merged_for_analysis` (translated description + OCR text, up to 5000 chars) |
| `api_key` | `str` | Google Cloud API key |

```python
# Call 1: Entity extraction
POST /documents:analyzeEntities
{"document": {"type": "PLAIN_TEXT", "content": text}, "encodingType": "UTF8"}

# Call 2: Sentiment analysis
POST /documents:analyzeSentiment
{"document": {"type": "PLAIN_TEXT", "content": text}, "encodingType": "UTF8"}
```

### What comes out

**Entities:**
```python
[
    {"name": "Toyota Corolla",  "type": "CONSUMER_GOOD", "salience": 0.42, "metadata": {}},
    {"name": "Helsinki",        "type": "LOCATION",       "salience": 0.18, "metadata": {"wikipedia_url": "..."}},
    {"name": "John Smith",      "type": "PERSON",          "salience": 0.12, "metadata": {}},
    {"name": "€2,450",          "type": "PRICE",           "salience": 0.08, "metadata": {}}
]
```

> **Salience** = how central this entity is to the meaning of the whole text. All salience values across all entities sum to 1.0. A salience of 0.42 means "Toyota Corolla" is the most important concept in this claim text.

**Sentiment:**
```python
{
    "score": -0.4,       # Range: -1.0 (very negative) to +1.0 (very positive)
    "magnitude": 1.2     # How strong the emotion is regardless of direction (0.0+)
}
```

### Why it's used

- **Entity types** (PERSON, LOCATION, ORGANIZATION, DATE, PRICE) help the summary identify who, where, and what amounts are involved
- **Salience** ranks which entities matter most — used to pick the top 3 locations, persons, orgs for the summary
- **Sentiment score** is a key risk signal: a very negative score (`≤ -0.2`) adds +25 points to the risk score — angry/distressed language can indicate fraudulent exaggeration

---

## 10. Service 6 — Azure Language Service

**File:** `app/services/azure_language.py` → `azure_key_phrases_and_pii()`

**API:** Azure Language unified endpoint → `/language/:analyze-text?api-version=2022-05-01`

Two separate POST calls are made to the same URL, differentiated only by the `kind` field.

### What goes in

| Input | Type | Description |
|---|---|---|
| `text` | `str` | `merged_for_analysis` (same text as Google NLP) |
| `endpoint` | `str` | Azure Language resource URL |
| `key` | `str` | Azure Language API key |

```python
# Call 1: Key phrase extraction
{"kind": "KeyPhraseExtraction", "analysisInput": {"documents": [{"id": "claim-1", "language": "en", "text": text}]}}

# Call 2: PII entity recognition
{"kind": "PiiEntityRecognition", "analysisInput": {"documents": [{"id": "claim-1", "language": "en", "text": text}]}}
```

### What comes out

**Key Phrases:**
```python
{
    "key_phrases": [
        "rear-end collision",
        "shopping centre parking lot",
        "Toyota Corolla",
        "insurance claim",
        "front bumper damage"
    ]
}
```

**PII Entities:**
```python
{
    "pii_entities": [
        {"text": "John Smith",      "category": "Person",          "confidenceScore": 0.98},
        {"text": "+358 40 123 456", "category": "PhoneNumber",     "confidenceScore": 0.95},
        {"text": "FI12345678",      "category": "FinnishNationalID","confidenceScore": 0.87}
    ]
}
```

### Why it's used

- **Key phrases** are the "highlight reel" of the claim text — used by Gemini to write a concise summary and shown in the UI
- **PII detection** is a compliance requirement: the system needs to flag that personal data (names, IDs, phone numbers) is present before sharing the analysis output with third parties
- PII detection triggers a +5 risk point flag (as a reminder that privacy handling is needed, not as a fraud signal)

---

## 11. Service 7 — Google Gemini (LLM Written Report)

**File:** `app/services/llm_report.py` → `generate_gemini_written_report()`

**API:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

### What goes in

A condensed version of all previous service outputs is assembled into a JSON context object and sent to Gemini:

```python
context = {
    "summary": { ... },         # Human-readable summary built from all services
    "risk": {                   # Risk engine output
        "score": 35,
        "level": "MEDIUM",
        "flags": ["Negative sentiment score: -0.4", "No clear date found in OCR/text"]
    },
    "translation": { ... },     # Detected language + translated text
    "document": {               # OCR summary
        "ocr_text_length": 1240,
        "ocr_preview": "REPAIR ESTIMATE\nDate: ..."
    },
    "text_analysis": {          # Top entities, key phrases, PII categories, sentiment
        "sentiment": {"score": -0.4, "magnitude": 1.2},
        "top_entities": [ ... ],
        "top_key_phrases": [ ... ],
        "pii_categories": ["Person", "PhoneNumber"]
    },
    "damage": {                 # Vision results
        "top_labels": ["Car", "Vehicle", "Road"],
        "azure_captions": ["a damaged silver car on the side of a road"],
        "safe_search": {"adult": "VERY_UNLIKELY", "violence": "UNLIKELY"}
    }
}
```

The model is instructed via a **system prompt**:

> "You are an insurance claims analyst assistant. You always respond using GitHub-flavoured Markdown with headings, bold, lists, and tables where appropriate. Be factual, concise, and cite only data present in the input. Do not provide legal advice."

And a **user prompt** that demands exactly 7 sections:

```
1. Executive Summary
2. Damage Evidence From Images
3. Document Evidence (OCR)
4. Text & Language Analysis
5. Compliance & Privacy Notes
6. Recommended Next Actions for Adjuster
7. Final Recommendation
```

**Model config:**
```python
"generationConfig": {"temperature": 0.2, "maxOutputTokens": 2000}
```

- `temperature: 0.2` — low randomness, factual output
- `maxOutputTokens: 2000` — enough for all 7 sections (~60-80 words each)

**Retry logic:** Automatically retries on HTTP 429 (rate limit) and 5xx errors, up to 2 times with exponential backoff. Falls back to `GOOGLE_GEMINI_FALLBACK_MODEL` if the primary model is quota-limited.

### What comes out

```python
{
    "enabled": True,
    "provider": "google",
    "model": "gemini-2.0-flash",
    "status": "ok",
    "report_markdown": "## Executive Summary\n\nThis claim involves...\n\n## Damage Evidence From Images\n...",
    "error": None,
    "usage": {
        "prompt_tokens": 820,
        "completion_tokens": 680,
        "total_tokens": 1500
    }
}
```

---

## 12. Risk Engine (Custom Python)

**File:** `app/services/risk_engine.py` → `calculate_risk_score()`

This is **not** a machine learning model — it is a deterministic, rule-based scoring function written in pure Python. It exists to demonstrate how multi-service outputs can be combined into a single decision signal.

### What goes in

All service outputs are passed together:

```python
calculate_risk_score(
    vision_labels=["Car", "Road", "Bicycle"],    # from Google Vision
    safe_search={"adult": "POSSIBLE", ...},      # merged worst-case across all images
    ocr_text="total loss, destroyed...",         # merged OCR text
    nlp_entities=[...],                          # from Google NLP
    sentiment={"score": -0.45, "magnitude": 1.8},
    translated_text="...",
    pii_entities=[...],
)
```

### Scoring rules

| Rule | Condition | Points |
|---|---|---|
| Safe Search — violence | `POSSIBLE` or above | +15 |
| Safe Search — adult | `POSSIBLE` or above | +10 |
| Safe Search — medical | `POSSIBLE` or above | +5 |
| Strong negative sentiment | score ≤ −0.20 | +25 |
| Slightly negative sentiment | score between −0.20 and −0.05 | +10 |
| Exaggeration keywords | "total loss", "destroyed", "completely", "worst", "never", "no damage", "100%" | +15 |
| Missing date in text | No date pattern found in OCR or description | +10 |
| Missing amount in text | No currency/number found | +10 |
| Entity mismatch | Vision says "car", text mentions "bicycle" (or other conflicting pairs) | +12 |
| PII detected | Any PII entities found | +5 (compliance flag) |

**Score is clamped to 0–100.**

### What comes out

```python
{
    "score": 45,
    "level": "MEDIUM",     # LOW < 40 | MEDIUM 40–69 | HIGH ≥ 70
    "flags": [
        "Negative sentiment score: -0.45",
        "Exaggeration keywords detected in text",
        "No clear date found in OCR/text"
    ],
    "breakdown": {
        "negative_sentiment": 25,
        "exaggeration_keywords": 15,
        "missing_date_signal": 10
    }
}
```

### Risk levels

| Score Range | Level | Meaning |
|---|---|---|
| 0 – 39 | **LOW** | Claim appears straightforward — proceed normally |
| 40 – 69 | **MEDIUM** | Some signals of concern — adjuster should review manually |
| 70 – 100 | **HIGH** | Multiple red flags — escalate for investigation before payout |

---

## 13. Full API Response Structure

`POST /api/analyze` returns a single JSON object:

```json
{
  "summary": {
    "text": "Images show: a damaged silver car. Locations: Helsinki. Risk level: MEDIUM (45/100).",
    "image_count": 2,
    "ocr_chars": 1240,
    "entity_count": 12,
    "pii_count": 2,
    "keyphrase_count": 8
  },
  "translation": {
    "source_language": "fi",
    "translated_description": "My car was rear-ended..."
  },
  "damage": {
    "google_labels": ["Car", "Vehicle", "Road"],
    "google_objects": [{"name": "Car", "score": 0.94}],
    "google_safe_search": {"adult": "VERY_UNLIKELY", "violence": "UNLIKELY", "medical": "VERY_UNLIKELY"},
    "azure_captions": [{"caption": "a damaged silver car on the side of a road", "tags": [...]}],
    "azure_tags": ["car", "outdoor", "damaged"],
    "per_image": [...]
  },
  "document": {
    "ocr_text_preview": "REPAIR ESTIMATE\nDate: 12/03/2024\n...",
    "ocr_text_length": 1240
  },
  "text_analysis": {
    "entities": [{"name": "Toyota Corolla", "type": "CONSUMER_GOOD", "salience": 0.42}],
    "sentiment": {"score": -0.4, "magnitude": 1.2},
    "key_phrases": ["rear-end collision", "front bumper damage"],
    "pii_entities": [{"text": "John Smith", "category": "Person", "confidenceScore": 0.98}]
  },
  "risk": {
    "score": 45,
    "level": "MEDIUM",
    "flags": ["Negative sentiment score: -0.4", "No clear date found in OCR/text"],
    "breakdown": {"negative_sentiment": 25, "missing_date_signal": 10, "pii_detected": 5}
  },
  "written_report": {
    "enabled": true,
    "provider": "google",
    "model": "gemini-2.0-flash",
    "status": "ok",
    "report_markdown": "## Executive Summary\n\n...",
    "error": null,
    "usage": {"prompt_tokens": 820, "completion_tokens": 680, "total_tokens": 1500}
  },
  "meta": {
    "total_duration_ms": 4821,
    "images_processed": 2,
    "documents_processed": 1,
    "services_called": [
      {"name": "Google Vision API", "provider": "google", "duration_ms": 621},
      {"name": "Azure Computer Vision", "provider": "azure", "duration_ms": 843},
      {"name": "Google Vision OCR", "provider": "google", "duration_ms": 512},
      {"name": "Google Translation API", "provider": "google", "duration_ms": 230},
      {"name": "Google Natural Language API", "provider": "google", "duration_ms": 410},
      {"name": "Azure Language Service", "provider": "azure", "duration_ms": 388},
      {"name": "Google Gemini (gemini-2.0-flash)", "provider": "google", "duration_ms": 1817}
    ],
    "service_errors": []
  }
}
```

---

## 14. Environment Variables Reference

Copy `.env.example` → `.env` and fill in:

| Variable | What it is | Where to get it |
|---|---|---|
| `GOOGLE_VISION_API_KEY` | Google Cloud API key with Vision API enabled | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_NLP_API_KEY` | Same key works if Natural Language API is also enabled | Same as above |
| `GOOGLE_TRANSLATE_API_KEY` | Same key works if Cloud Translation API is also enabled | Same as above |
| `AZURE_VISION_ENDPOINT` | Your Azure Computer Vision resource URL | Azure Portal → your resource → Keys and Endpoint |
| `AZURE_VISION_KEY` | Azure Computer Vision API key | Same as above |
| `AZURE_LANGUAGE_ENDPOINT` | Your Azure Language resource URL | Azure Portal → Language resource → Keys and Endpoint |
| `AZURE_LANGUAGE_KEY` | Azure Language API key | Same as above |
| `GOOGLE_GEMINI_API_KEY` | Gemini API key | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `GOOGLE_GEMINI_MODEL` | Primary Gemini model name | Default: `gemini-2.0-flash` |
| `GOOGLE_GEMINI_FALLBACK_MODEL` | Fallback if primary hits quota | Default: `gemini-flash-latest` |
| `MAX_PDF_PAGES` | How many PDF pages to OCR (optional) | Default: `3` |

> **Google API key tip:** You can use a **single Google API key** for Vision, NLP, and Translation — just enable all three APIs in the same Google Cloud project and set the same key for all three variables.

> **Azure tip:** Vision and Language are **separate Azure resources** with different endpoints and keys. Do not mix them up.
