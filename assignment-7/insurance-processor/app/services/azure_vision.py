from __future__ import annotations

from typing import Any, Dict, List

from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential


def azure_image_caption_tags_objects(
    endpoint: str,
    key: str,
    image_bytes: bytes,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Uses Azure AI Vision Image Analysis SDK to extract:
    - caption
    - tags
    - objects
    """
    client = ImageAnalysisClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key),
    )

    visual_features = [VisualFeatures.CAPTION, VisualFeatures.TAGS, VisualFeatures.OBJECTS]

    # NOTE: SDK call is synchronous.
    result = client.analyze(
        image_data=image_bytes,
        visual_features=visual_features,
        language=language,
    )

    caption_obj = getattr(result, "caption", None)
    caption_text = caption_obj.text if caption_obj else None

    tags_result = getattr(result, "tags", None)
    tag_items = getattr(tags_result, "list", None) or []
    tags: List[str] = []
    for t in tag_items:
        name = getattr(t, "name", None)
        if name:
            tags.append(name)

    objects_result = getattr(result, "objects", None)
    obj_items = getattr(objects_result, "list", None) or []
    objects: List[Dict[str, Any]] = []
    for obj in obj_items:
        obj_tags = getattr(obj, "tags", None) or []
        obj_name = obj_tags[0].name if obj_tags else None
        objects.append(
            {
                "name": obj_name,
                "confidence": obj_tags[0].confidence if obj_tags else None,
                "bounding_box": {
                    "x": getattr(getattr(obj, "bounding_box", None), "x", None),
                    "y": getattr(getattr(obj, "bounding_box", None), "y", None),
                    "width": getattr(getattr(obj, "bounding_box", None), "width", None),
                    "height": getattr(getattr(obj, "bounding_box", None), "height", None),
                } if getattr(obj, "bounding_box", None) else None,
            }
        )

    return {
        "caption": caption_text,
        "tags": tags,
        "objects": objects,
    }

