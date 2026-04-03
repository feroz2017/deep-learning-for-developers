# AI‑Powered Insurance Claims Processor — Full Implementation Plan

## Market Opportunity

- **InsurTech market**: projected $150B+ globally by 2030, ~30% YoY growth
- **Claims automation**: multi-billion dollar sub-segment
- Insurance companies spend $10–30 per claim on manual processing; automation cuts 60–80%
- Fraud detection alone saves billions annually

---

## MVP Scope — What to Build

### Core User Flow

1. **Claimant** opens the web app
2. Uploads **damage photos** (car crash, property damage, injury)
3. Uploads **supporting documents** (police report PDF, medical bill, receipt)
4. Optionally records/types a **description** of what happened (any language)
5. Clicks **"Analyze Claim"**
6. App returns:
   - Detected **objects & damage type** from photos
   - Extracted **text & data** from documents (dates, amounts, parties)
   - **Sentiment & entity analysis** of the description (fraud signal detection)
   - **Translation** to English if description is in another language
   - A structured **Claim Summary Card** with risk/fraud score

### MVP Features — 11 Services × 4 Providers

#### VISION PIPELINE (3 providers analyze every photo)

| # | Feature                    | What it does                                                          | Provider              | Service                   | Free Tier                          |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|------------------------------------|
| 1 | Damage Label Detection     | Detect objects & labels (car, dent, fire, glass, etc.)                | **Google**            | Vision API                | 1,000 units/month (no expiry)      |
| 2 | Image Captioning           | Generate a human-readable sentence describing the damage scene        | **Azure**             | Computer Vision (F0)      | 5,000 txn/month (no expiry)        |
| 3 | Object & PPE Detection     | Detect objects, moderation labels, protective equipment, text in image| **AWS**               | Rekognition               | 1,000 images/month (12 months)     |

> Why 3 vision services? Each returns different data — Google gives labels/objects, Azure gives a natural-language caption, AWS gives moderation + PPE + text-in-image. Together they build a richer damage profile.

#### DOCUMENT OCR PIPELINE (2 providers)

| # | Feature                    | What it does                                                          | Provider              | Service                   | Free Tier                          |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|------------------------------------|
| 4 | Document Text Extraction   | OCR on police reports, bills, receipts (full text + paragraphs)       | **Google**            | Vision API (OCR)          | (shared with #1 quota)             |
| 5 | Structured Document Parsing| Extract tables, key-value pairs, form fields from documents           | **AWS**               | Textract                  | 1,000 pages/month (3 months)       |

> Why 2 OCR services? Google Vision gives raw text; AWS Textract additionally extracts **tables and key-value pairs** (e.g. "Date: 2026-03-15", "Amount: €4,500") — critical for insurance documents.

#### NLP / TEXT ANALYSIS PIPELINE (3 providers)

| # | Feature                    | What it does                                                          | Provider              | Service                   | Free Tier                          |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|------------------------------------|
| 6 | Entity & Sentiment         | Extract entities (person, date, amount, location) + sentiment score   | **Google**            | Natural Language API      | 5,000 chars/month (no expiry)      |
| 7 | Emotion Detection          | Detect emotions: anger, fear, joy, sadness, disgust per sentence      | **IBM**               | Watson NLU (Lite)         | 30,000 API items/month (no expiry) |
| 8 | Key Phrases + PII Detection| Extract key phrases + detect personal info (names, addresses, IDs)    | **Azure**             | Language Service (F0)     | 5,000 text records/month (no expiry)|

> Why 3 NLP services? Google gives entities + sentiment. IBM uniquely provides **emotion analysis** (anger/fear = potential fraud or distress signals). Azure adds **PII detection** (auto-flag sensitive data in claims) + key phrases.

#### TRANSLATION (1 provider)

| # | Feature                    | What it does                                                          | Provider              | Service                   | Free Tier                          |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|------------------------------------|
| 9 | Language Detect + Translate | Auto-detect claimant's language, translate everything to English      | **Google**            | Translation API           | 500,000 chars/month (no expiry)    |

#### SPEECH (2 providers — input + output)

| # | Feature                    | What it does                                                          | Provider              | Service                   | Free Tier                          |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|------------------------------------|
| 10| Voice Claim Input          | Claimant records voice description → transcribed to text              | **Google**            | Speech-to-Text            | 60 min/month (no expiry)           |
| 11| Audio Claim Summary        | Generate spoken audio summary of the claim report for the adjuster   | **Google**            | Text-to-Speech            | 4M chars/month (no expiry)         |

#### CLAIM ENGINE (custom logic)

| # | Feature                    | What it does                                                          | Provider              | Service                   |
|---|--------------------------- |-----------------------------------------------------------------------|-----------------------|---------------------------|
| — | Risk & Fraud Scoring       | Aggregate all 11 service outputs → weighted risk score 0–100         | **Custom**            | Python rule engine        |
| — | Claim Summary Dashboard    | Visual report with all findings, flags, and recommendations           | **Custom**            | Streamlit UI              |

---

### Service Count Summary

| Provider      | # Services | Services Used                                                   |
|---------------|------------|------------------------------------------------------------------|
| **Google**    | 5          | Vision, Natural Language, Translation, Speech-to-Text, Text-to-Speech |
| **AWS**       | 2          | Rekognition, Textract                                            |
| **Azure**     | 2          | Computer Vision, Language Service (Text Analytics)               |
| **IBM**       | 1          | Watson NLU                                                       |
| **Custom**    | 1          | Risk scoring engine (Python)                                     |
| **TOTAL**     | **11**     | **4 cloud providers + custom logic**                             |

---

### What NOT to include in MVP

- No user authentication / login system
- No database / persistent storage (just process and display)
- No real payment / payout calculation
- No mobile app (web only)
- No real-time video analysis

---

## Free Tier Budget — All 11 Services

| # | Provider   | Service              | Free Tier                        | Expiry?       | Enough for MVP? |
|---|-----------|----------------------|----------------------------------|---------------|-----------------|
| 1 | Google    | Vision API           | 1,000 units/month                | Never         | Yes (demo ~20 images) |
| 2 | Azure     | Computer Vision F0   | 5,000 transactions/month         | Never         | Yes             |
| 3 | AWS       | Rekognition          | 1,000 images/month               | 12 months     | Yes             |
| 4 | Google    | Vision API (OCR)     | (shared with #1)                 | Never         | Yes             |
| 5 | AWS       | Textract             | 1,000 pages/month                | 3 months      | Yes             |
| 6 | Google    | Natural Language     | 5,000 chars/month                | Never         | Yes             |
| 7 | IBM       | Watson NLU Lite      | 30,000 API items/month           | Never         | Yes             |
| 8 | Azure     | Language Service F0  | 5,000 text records/month         | Never         | Yes             |
| 9 | Google    | Translation          | 500,000 chars/month              | Never         | Yes             |
| 10| Google    | Speech-to-Text       | 60 minutes/month                 | Never         | Yes             |
| 11| Google    | Text-to-Speech       | 4M chars/month                   | Never         | Yes             |

**Plus bonus credits**: Google $300 (90 days), AWS $200 (new accounts), Azure $200 (30 days).

**Total cost for this MVP: $0.**

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           STREAMLIT WEB UI                                │
│  ┌──────────────┐   ┌────────────────┐   ┌─────────────────────────────┐  │
│  │ Upload Photos │   │ Upload Docs    │   │ Text Input / Record Voice   │  │
│  │ (damage imgs) │   │ (PDF/scans)    │   │ (claim description)         │  │
│  └──────┬───────┘   └───────┬────────┘   └──────────────┬──────────────┘  │
└─────────┼──────────────────┼────────────────────────────┼─────────────────┘
          │                  │                            │
          │                  │                     ┌──────▼──────────────┐
          │                  │                     │ [10] Google STT     │
          │                  │                     │ Voice → Text        │
          │                  │                     └──────┬──────────────┘
          │                  │                            │
          │                  │                     ┌──────▼──────────────┐
          │                  │                     │ [9] Google Translate│
          │                  │                     │ Detect lang → EN    │
          │                  │                     └──────┬──────────────┘
          │                  │                            │
          ▼                  ▼                            ▼
┌─────────────────┐ ┌────────────────┐     ┌──────────────────────────────┐
│ VISION PIPELINE │ │ OCR PIPELINE   │     │ NLP PIPELINE (3 providers)   │
│ (3 providers)   │ │ (2 providers)  │     │                              │
│                 │ │                │     │ ┌──────────────────────────┐  │
│ [1] Google      │ │ [4] Google     │     │ │ [6] Google NL API        │  │
│   Vision API    │ │   Vision OCR   │     │ │  Entities + Sentiment    │  │
│   Labels+Objects│ │   Full text    │     │ └──────────────────────────┘  │
│                 │ │                │     │ ┌──────────────────────────┐  │
│ [2] Azure       │ │ [5] AWS        │     │ │ [7] IBM Watson NLU       │  │
│   Computer Vis. │ │   Textract     │     │ │  Emotions (anger/fear/   │  │
│   Caption+Tags  │ │   Tables+KV    │     │ │  joy/sadness/disgust)    │  │
│                 │ │   pairs+forms  │     │ └──────────────────────────┘  │
│ [3] AWS         │ │                │     │ ┌──────────────────────────┐  │
│   Rekognition   │ └────────┬───────┘     │ │ [8] Azure Language Svc   │  │
│   Moderation+   │          │             │ │  Key phrases + PII       │  │
│   PPE+TextInImg │          │             │ │  detection               │  │
└────────┬────────┘          │             │ └──────────────────────────┘  │
         │                   │             └──────────────┬───────────────┘
         │                   │                            │
         ▼                   ▼                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     CLAIM PROCESSING ENGINE (Python)                      │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ Vision Fusion    │  │ Document Fusion  │  │ Text Analysis Fusion     │  │
│  │ Merge 3 vision   │  │ Merge OCR text + │  │ Merge entities +         │  │
│  │ outputs into     │  │ Textract tables  │  │ sentiment + emotions +   │  │
│  │ unified damage   │  │ into structured  │  │ key phrases + PII flags  │  │
│  │ profile          │  │ claim data       │  │ into risk indicators     │  │
│  └────────┬────────┘  └────────┬─────────┘  └───────────┬──────────────┘  │
│           │                    │                         │                 │
│           └────────────────────┼─────────────────────────┘                 │
│                                ▼                                          │
│                    ┌──────────────────────┐                               │
│                    │ RISK SCORING ENGINE  │                               │
│                    │ Weighted score 0–100 │                               │
│                    │ + fraud flag reasons │                               │
│                    └──────────┬───────────┘                               │
└───────────────────────────────┼───────────────────────────────────────────┘
                                │
                   ┌────────────▼─────────────┐
                   │ [11] Google Text-to-Speech│
                   │ Generate audio summary    │
                   └────────────┬──────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        CLAIM SUMMARY DASHBOARD                           │
│                                                                           │
│  ┌─────────────────┐ ┌────────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ 📷 Damage Report│ │ 📄 Document    │ │ 💬 Text      │ │ ⚠️ Risk    │  │
│  │                 │ │ Extraction     │ │ Analysis     │ │ Score      │  │
│  │ - Labels (G)    │ │                │ │              │ │            │  │
│  │ - Caption (Az)  │ │ - Full text    │ │ - Entities   │ │ Score: 73  │  │
│  │ - Moderation    │ │ - Table data   │ │ - Sentiment  │ │ [████░░░]  │  │
│  │   flags (AWS)   │ │ - Key-value    │ │ - Emotions   │ │            │  │
│  │ - PPE check     │ │   pairs        │ │ - Key phrases│ │ Flags:     │  │
│  │   (AWS)         │ │ - Dates,       │ │ - PII alerts │ │ - High fear│  │
│  │ - Objects with  │ │   amounts,     │ │ - Language   │ │ - Missing  │  │
│  │   bounding box  │ │   parties      │ │   detected   │ │   date     │  │
│  └─────────────────┘ └────────────────┘ └──────────────┘ └────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 🔊 Play Audio Summary (Google TTS)                      [▶ Play]  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan — Step by Step

### Phase 0: Account Setup (Day 1 — 1.5 hours)

- [ ] **Google Cloud**:
  - Create project at https://console.cloud.google.com
  - Enable: Vision API, Natural Language API, Translation API, Speech-to-Text API, Text-to-Speech API
  - Create service account → download JSON key
- [ ] **AWS**:
  - Create account at https://aws.amazon.com (or use existing)
  - Create IAM user with Rekognition + Textract permissions
  - Save Access Key ID + Secret Access Key
- [ ] **Azure**:
  - Create account at https://portal.azure.com
  - Create resource: "Computer Vision" (F0 free tier)
  - Create resource: "Language" (F0 free tier)
  - Save KEY + Endpoint for each
- [ ] **IBM Cloud**:
  - Create account at https://cloud.ibm.com
  - Create "Natural Language Understanding" service (Lite plan)
  - Save API Key + Service URL
- [ ] **Install Python dependencies**:
  ```
  pip install streamlit
  pip install google-cloud-vision google-cloud-language google-cloud-translate google-cloud-speech google-cloud-texttospeech
  pip install boto3
  pip install azure-ai-vision-imageanalysis azure-ai-textanalytics
  pip install ibm-watson
  pip install Pillow python-dotenv
  ```

### Phase 1: Google Vision — Labels + OCR (Day 1 — 1.5 hours)

- [ ] `google_vision.py`:
  - `analyze_photo(image_bytes)` → call LABEL_DETECTION, OBJECT_LOCALIZATION, SAFE_SEARCH_DETECTION
  - `extract_text_ocr(image_bytes)` → call DOCUMENT_TEXT_DETECTION
  - Returns: `{ labels, objects, safety_flags, ocr_text }`

### Phase 2: Azure Computer Vision — Captioning (Day 1 — 1 hour)

- [ ] `azure_vision.py`:
  - `caption_image(image_bytes)` → call Azure Image Analysis (features: caption, tags, objects)
  - Returns: `{ caption: "A damaged car on the side of the road", tags: [...], objects: [...] }`

### Phase 3: AWS Rekognition — Moderation + PPE (Day 1 — 1.5 hours)

- [ ] `aws_rekognition.py`:
  - `detect_labels_and_moderation(image_bytes)` → call DetectLabels + DetectModerationLabels
  - `detect_ppe(image_bytes)` → call DetectProtectiveEquipment
  - `detect_text_in_image(image_bytes)` → call DetectText
  - Returns: `{ labels, moderation_flags, ppe_detected, text_in_image }`

### Phase 4: AWS Textract — Document Structure (Day 1 — 1 hour)

- [ ] `aws_textract.py`:
  - `extract_document(image_bytes)` → call AnalyzeDocument (FeatureTypes: TABLES, FORMS)
  - Returns: `{ full_text, tables: [...], key_value_pairs: {"Date": "2026-03-15", "Amount": "€4,500"} }`

### Phase 5: Google NLP — Entities + Sentiment (Day 2 — 1 hour)

- [ ] `google_nlp.py`:
  - `analyze_text(text)` → call analyzeEntities + analyzeSentiment
  - Returns: `{ entities: [...], sentiment: {score, magnitude}, categories: [...] }`

### Phase 6: IBM Watson NLU — Emotion Detection (Day 2 — 1 hour)

- [ ] `ibm_nlu.py`:
  - `analyze_emotions(text)` → call NLU with features: emotion, keywords, entities
  - Returns: `{ emotions: {anger: 0.8, fear: 0.6, joy: 0.1, sadness: 0.3, disgust: 0.2}, keywords: [...] }`

### Phase 7: Azure Language — Key Phrases + PII (Day 2 — 1 hour)

- [ ] `azure_language.py`:
  - `extract_key_phrases(text)` → call Azure extractKeyPhrases
  - `detect_pii(text)` → call Azure recognizePiiEntities
  - Returns: `{ key_phrases: [...], pii_entities: [{text: "John Doe", category: "Person"}, ...] }`

### Phase 8: Google Translation (Day 2 — 30 min)

- [ ] `google_translate.py`:
  - `detect_and_translate(text)` → detect language, translate to EN if needed
  - Returns: `{ source_lang, translated_text, original_text }`

### Phase 9: Google Speech-to-Text + Text-to-Speech (Day 2 — 1 hour)

- [ ] `google_speech.py`:
  - `transcribe_audio(audio_bytes)` → call Speech-to-Text
  - `generate_audio_summary(text)` → call Text-to-Speech → return audio bytes
  - Returns: transcribed text / audio MP3 bytes

### Phase 10: Risk Scoring Engine (Day 2 — 1.5 hours)

- [ ] `risk_engine.py`:
  - `calculate_risk_score(all_results)` → weighted rule-based scoring:
    - IBM emotion: high anger/fear → +15 risk points
    - Google sentiment: strong negative → +15 risk points
    - Azure PII: unreported PII found in documents → +10 risk points
    - AWS moderation: flagged content → +10 risk points
    - Missing key-value data (no date/amount in Textract) → +10 risk points
    - Entity mismatch (description vs photo labels) → +15 risk points
    - Exaggerated language keywords → +10 risk points
    - No PPE in workplace injury claim → +10 risk points
    - Safe search flags → +5 risk points
  - Returns: `{ score: 73, level: "HIGH", flags: [...], breakdown: {...} }`

### Phase 11: Streamlit UI + Integration (Day 3 — 3 hours)

- [ ] `app.py`:
  - **Sidebar**: App title, provider status indicators (green dots), instructions
  - **Input section**:
    - Multi-file uploader for damage photos
    - File uploader for supporting documents (PDF/image)
    - Text area for description (or audio recorder)
    - Language selector (or auto-detect)
    - Big "🔍 Analyze Claim" button
  - **Results section** (4-column dashboard):
    - **Column 1 — Damage Report**: photos with labels, caption, moderation flags, PPE
    - **Column 2 — Document Data**: OCR text, tables, extracted key-value pairs
    - **Column 3 — Text Analysis**: entities, sentiment bar, emotion radar chart, key phrases, PII warnings
    - **Column 4 — Risk Score**: gauge 0–100, color-coded, flag list, breakdown accordion
  - **Audio section**: play button for TTS claim summary
  - **Raw JSON expander**: show raw API responses for debugging/demo

### Phase 12: Polish & Demo Data (Day 3 — 1 hour)

- [ ] Add error handling for each API (graceful fallback if one provider fails)
- [ ] Include sample demo data (car crash photo, sample police report PDF, sample description)
- [ ] Test full pipeline end-to-end
- [ ] Take screenshots for PPT
- [ ] Record short demo video (optional)

---

## PPT Presentation Structure (for Task 7 submission)

### Slide 1: Title
- "AI-Powered Insurance Claims Processor"
- Team members, course info

### Slides 2–4: Multiple Ideas (paper prototypes)
- Idea A: Insurance Claims Processor (chosen for implementation)
- Idea B: Medical Report Summarizer
- Idea C: Accident Scene Reconstruction Tool
- Each with: problem description, use-case sketch, GUI mockup drawing

### Slides 5–6: Chosen Solution — Description & Use Case
- Problem: manual claims processing is slow, expensive, fraud-prone
- Solution: automated AI analysis of photos + documents + descriptions
- GUI sketch / wireframe of the Streamlit app

### Slide 7: Architecture
- The architecture diagram from above
- Label each box with: service name, input, output

### Slide 8: Building Blocks Detail
- Table: Service → Provider → Input → Output → Free Tier
- Show how services chain together

### Slides 9–10: Demo Screenshots
- Screenshots of the running app with sample data
- Show each panel: image analysis, OCR results, NLP entities, risk score

### Slide 11: Risks & Limitations
- Inaccurate damage detection (Vision API not trained for insurance)
- Sentiment analysis doesn't understand insurance-specific fraud patterns
- Privacy concerns (sensitive photos/documents sent to cloud)
- Free tier limits (not production-ready)
- Language coverage gaps
- No legal validity of AI-generated risk score

### Slide 12: Improvements & Future Work
- Fine-tune a custom model for damage classification (Vertex AI / AutoML)
- Add real claims database for ML-based fraud detection
- On-premise deployment for data privacy compliance
- Integration with actual insurance CRM/ERP systems
- Mobile app for field agents

---

## File Structure for Submission

```
ties4911-task07-<group_name>.zip
├── Task7-instructions.doc
├── presentation.pptx
├── source_code/
│   ├── app.py                     # Main Streamlit application
│   ├── google_vision.py           # [1,4] Google Vision — labels, objects, OCR
│   ├── azure_vision.py            # [2]   Azure Computer Vision — caption, tags
│   ├── aws_rekognition.py         # [3]   AWS Rekognition — moderation, PPE, text
│   ├── aws_textract.py            # [5]   AWS Textract — tables, key-value pairs
│   ├── google_nlp.py              # [6]   Google NL API — entities, sentiment
│   ├── ibm_nlu.py                 # [7]   IBM Watson NLU — emotions, keywords
│   ├── azure_language.py          # [8]   Azure Language — key phrases, PII
│   ├── google_translate.py        # [9]   Google Translation — detect + translate
│   ├── google_speech.py           # [10,11] Google STT + TTS
│   ├── risk_engine.py             # Risk scoring logic (aggregates all services)
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Template for all 4 provider credentials
│   └── README.md                  # Setup guide for all providers + how to run
└── demo_data/
    ├── sample_car_damage.jpg
    ├── sample_property_damage.jpg
    ├── sample_police_report.pdf
    ├── sample_medical_bill.jpg
    └── sample_description.txt
```

---

## Quick Start Commands

```bash
# 1. Install all dependencies
pip install streamlit \
  google-cloud-vision google-cloud-language google-cloud-translate \
  google-cloud-speech google-cloud-texttospeech \
  boto3 \
  azure-ai-vision-imageanalysis azure-ai-textanalytics \
  ibm-watson \
  Pillow python-dotenv

# 2. Create .env file with all credentials
cp source_code/.env.example source_code/.env
# Then edit .env and fill in your keys:
#   GOOGLE_APPLICATION_CREDENTIALS=path/to/google-service-account.json
#   AWS_ACCESS_KEY_ID=...
#   AWS_SECRET_ACCESS_KEY=...
#   AWS_REGION=us-east-1
#   AZURE_VISION_KEY=...
#   AZURE_VISION_ENDPOINT=...
#   AZURE_LANGUAGE_KEY=...
#   AZURE_LANGUAGE_ENDPOINT=...
#   IBM_NLU_API_KEY=...
#   IBM_NLU_URL=...

# 3. Run the app
streamlit run source_code/app.py
```

---

## Summary: Why This MVP Maximizes Marks

✓ **11 cognitive services** across **4 cloud providers** (Google, AWS, Azure, IBM)
✓ **5 task categories** covered: Vision, Speech, Language/NLP, Knowledge/OCR, Translation
✓ Each provider adds **unique value** (not just duplicating the same feature):
  - Google: core labels + OCR + sentiment + translation + speech I/O
  - Azure: image captioning (unique) + PII detection (unique)
  - AWS: content moderation (unique) + PPE detection (unique) + structured document parsing (unique)
  - IBM: emotion detection (unique — anger/fear/joy/sadness/disgust)
✓ **All free** — $0 cost using free tiers
✓ Clear **commercial value** ($150B+ InsurTech market)
✓ Implementable in **3 days** by a team of 3
✓ Visually impressive **4-panel dashboard** with audio playback
✓ Rich **risks & improvements** section for slides
✓ Clean **modular codebase** (one file per provider = easy to explain in demo)
