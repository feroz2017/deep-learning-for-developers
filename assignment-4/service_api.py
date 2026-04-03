import io
import json
import os

import torch
import torch.nn as nn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from torchvision import models, transforms

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
WEIGHTS_PATH  = os.path.join(ARTIFACTS_DIR, "multilabel_model.pt")
CLASSES_PATH  = os.path.join(ARTIFACTS_DIR, "multilabel_classes.json")

DEVICE = torch.device("mps" if torch.cuda.is_available() else "cpu")

# ---------------------------------------------------------------------------
# Image pre-processing  (same as training)
# ---------------------------------------------------------------------------
eval_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def open_image_bytes(data: bytes) -> Image.Image:
    """Decode image bytes to PIL Image (RGB). Raises ValueError if invalid."""
    if not data:
        raise ValueError("Empty file")
    try:
        return Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Not a valid image (use JPEG, PNG, or WebP): {e}") from e


def preprocess(image: Image.Image) -> torch.Tensor:
    return eval_transform(image).unsqueeze(0).to(DEVICE)


# ---------------------------------------------------------------------------
# Model  (MobileNetV3-Small, loaded once on first request)
# ---------------------------------------------------------------------------
model = None
class_names = None


def load_model():
    global model, class_names
    if model is not None:
        return

    with open(CLASSES_PATH) as f:
        class_names = json.load(f)

    # weights=None -> don't download ImageNet weights (we load our own)
    m = models.mobilenet_v3_small(weights=None)
    m.classifier[-1] = nn.Linear(m.classifier[-1].in_features, len(class_names))
    m.load_state_dict(torch.load(WEIGHTS_PATH, map_location="cpu"))
    model = m.to(DEVICE).eval()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Multi-label Image Classifier", version="1.0")

# CORS so the static page can call the API from another origin or file://
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to static HTML (next to this file)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
INDEX_HTML = os.path.join(STATIC_DIR, "index.html")


@app.get("/health")
def health():
    return {
        "device": str(DEVICE),
        "model_loaded": model is not None,
        "classes": class_names,
        "artifacts_dir": ARTIFACTS_DIR,
    }


# ---------------------------------------------------------------------------
# Static HTML page (separate file; CORS enabled above)
# ---------------------------------------------------------------------------
@app.get("/")
def index():
    if os.path.isfile(INDEX_HTML):
        return FileResponse(INDEX_HTML, media_type="text/html")
    return JSONResponse(status_code=404, content={"error": "static/index.html not found"})


# ---------------------------------------------------------------------------
# POST /predict-multilabel
# ---------------------------------------------------------------------------
@app.post("/predict-multilabel")
async def predict_multilabel(file: UploadFile = File(...), threshold: float = 0.5):
    load_model()

    # Read body once with await (required for async; avoids empty/corrupt reads)
    data = await file.read()
    try:
        image = open_image_bytes(data)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

    x = preprocess(image)
    with torch.no_grad():
        logits = model(x)[0]
        scores = torch.sigmoid(logits).cpu().tolist()
    print(class_names)
    print(scores)
    predicted_labels = [class_names[i] for i, s in enumerate(scores) if s >= threshold]

    return {
        "threshold": threshold,
        "predicted_labels": predicted_labels,
        "scores": {class_names[i]: round(scores[i], 4) for i in range(len(class_names))},
    }
