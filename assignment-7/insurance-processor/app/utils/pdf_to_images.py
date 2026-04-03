from __future__ import annotations

import io
from typing import List, Tuple

import fitz  # PyMuPDF
from PIL import Image


def pdf_bytes_to_images(
    pdf_bytes: bytes,
    max_pages: int = 3,
    dpi: int = 200,
) -> List[Tuple[bytes, str]]:
    """
    Convert a PDF (bytes) into a list of JPEG images (bytes) in-memory.

    Returns: [(image_bytes, mime_type), ...]
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = min(len(doc), max_pages)

    results: List[Tuple[bytes, str]] = []
    for page_index in range(pages):
        page = doc.load_page(page_index)
        pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=90)
        results.append((buf.getvalue(), "image/jpeg"))

    return results

