from typing import Dict, Any, List, Optional
from app.ai.classifier import classify_complaint
from app.ai.summarizer import generate_actionable_summary
from app.ai.duplicate_detector import detect_duplicate_candidates
from app.ai.prioritizer import calculate_priority_score
from app.ai.clustering import detect_hotspots

def run_ai_pipeline(
    title: str,
    description: str,
    category: str,
    address: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    existing_complaints: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Executes the complete CivicSense AI analytical workflow:
    1. Categorization & confidence assessment
    2. Factual administrative summarization
    3. 5-factor explainable priority scoring
    4. Multi-factor duplicate candidate detection
    """
    if existing_complaints is None:
        existing_complaints = []

    # 1. Classification
    classification = classify_complaint(title, description)
    final_category = category if category and category != "Other" else classification["predicted_category"]

    # 2. Summarization
    summary = generate_actionable_summary(title, description, final_category, address)

    # 3. Repeat count around this zone
    nearby_count = 0
    if latitude and longitude:
        from app.ai.duplicate_detector import haversine_distance_km
        for ec in existing_complaints:
            if ec.get("latitude") and ec.get("longitude"):
                if haversine_distance_km(latitude, longitude, ec["latitude"], ec["longitude"]) <= 0.8:
                    nearby_count += 1

    # 4. Priority Calculation
    priority_res = calculate_priority_score(
        title=title,
        description=description,
        category=final_category,
        address=address,
        nearby_complaint_count=nearby_count
    )

    # 5. Duplicate Detection
    temp_complaint = {
        "id": -1,
        "title": title,
        "description": description,
        "category": final_category,
        "latitude": latitude,
        "longitude": longitude
    }
    duplicate_matches = detect_duplicate_candidates(
        new_complaint=temp_complaint,
        existing_complaints=existing_complaints
    )

    return {
        "predicted_category": classification["predicted_category"],
        "confidence": classification["confidence"],
        "classification_explanation": classification["explanation"],
        "analysis_method": classification["method"],
        "ai_summary": summary,
        "priority": priority_res["priority"],
        "priority_score": priority_res["priority_score"],
        "priority_explanation": priority_res["priority_explanation"],
        "priority_factors": priority_res["priority_factors"],
        "duplicate_candidates": duplicate_matches
    }

__all__ = [
    "classify_complaint",
    "generate_actionable_summary",
    "detect_duplicate_candidates",
    "calculate_priority_score",
    "detect_hotspots",
    "run_ai_pipeline",
]
