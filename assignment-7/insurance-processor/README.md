# Insurance Claims Processor (FastAPI + Cognitive Services)

This is a small MVP for Task 7: users upload damage photos + documents + a description, and the app produces:

- Vision labels / objects / safe-search flags (Google Vision)
- Image caption/tags/objects (Azure Computer Vision)
- Document OCR text (Google Vision OCR on images + PDFs converted to images)
- Entities + sentiment from the description/OCR (Google Natural Language)
- Key phrases + PII detection (Azure Language Service)
- A simple rule-based risk score and explanation (Python)

## Project structure

- `app/main.py`: FastAPI app + endpoints + template routes
- `app/services/*`: provider-specific client wrappers

## Setup

1. Create a virtual environment (use Python 3) and install:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in keys/endpoints:
   ```bash
   cp .env.example .env
   ```

3. Run (from this folder):
   ```bash
   cd assignment-7/insurance-processor
   uvicorn app.main:app --reload --port 8000
   ```

4. Open:
   - http://localhost:8000/

## Demo input expectations

- Photos: JPG/PNG are recommended.
- Documents:
  - If you upload a PDF, the MVP converts the first `MAX_PDF_PAGES` pages into images and runs OCR on those pages.

## Notes / limitations (MVP)

- This is not a legal/insurance decision system; risk scoring is heuristic.
- OCR/detection quality depends on image quality and language.
- Production-grade claims processing requires human review and proper compliance controls.

