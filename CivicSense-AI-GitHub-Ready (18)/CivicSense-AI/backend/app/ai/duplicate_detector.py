import math
import re
from typing import List, Dict, Any, Optional

SYNONYM_REPLACEMENTS = {
    r"\b(waterlog|waterlogging|waterlogged|flooded|flooding|stagnation|stagnant)\b": "water_inundation",
    r"\b(potholes|pothole|crater|craters|sinkhole|broken road)\b": "road_damage",
    r"\b(garbage|trash|waste|rubbish|debris|dump|dumping)\b": "solid_waste",
    r"\b(streetlight|streetlights|street light|street lights|lamp|lamppost|lamp post)\b": "illumination",
    r"\b(drain|drainage|gutter|sewage|sewer|manhole)\b": "drainage_system",
    r"\b(pipeline|pipe|tap water|water supply|leakage|burst)\b": "water_network",
    r"\b(danger|dangerous|hazard|hazardous|accident|risk)\b": "safety_risk"
}

def clean_and_normalize(text: str) -> str:
    cleaned = text.lower()
    for pattern, replacement in SYNONYM_REPLACEMENTS.items():
        cleaned = re.sub(pattern, replacement, cleaned)
    return cleaned

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in kilometers.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999.0

    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 3)

def tokenize(text: str) -> List[str]:
    stopwords = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
        "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
        "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
        "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
        "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers", "him", "his",
        "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "let's", "me", "more", "most",
        "my", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
        "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the",
        "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too",
        "under", "until", "up", "very", "was", "wasn't", "we", "were", "what", "when", "where",
        "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours"
    }
    normalized = clean_and_normalize(text)
    words = re.findall(r"[a-z0-9_]+", normalized)
    stemmed = []
    for w in words:
        if len(w) > 2 and w not in stopwords:
            # Simple suffix reduction
            if w.endswith("ing") and len(w) > 5:
                w = w[:-3]
            elif w.endswith("ed") and len(w) > 4:
                w = w[:-2]
            elif w.endswith("s") and not w.endswith("ss") and len(w) > 3:
                w = w[:-1]
            stemmed.append(w)
    return stemmed

def compute_tf_idf_cosine_similarity(text1: str, text2: str) -> float:
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)

    if not tokens1 or not tokens2:
        return 0.0

    vocab = sorted(list(set(tokens1 + tokens2)))
    
    df = {}
    for term in vocab:
        count = 0
        if term in tokens1:
            count += 1
        if term in tokens2:
            count += 1
        df[term] = count

    N = 2.0
    idf = {term: math.log((N + 1.0) / (df[term] + 1.0)) + 1.0 for term in vocab}

    tf1 = {}
    for term in tokens1:
        tf1[term] = tf1.get(term, 0) + 1
    v1 = [tf1.get(term, 0) * idf[term] for term in vocab]

    tf2 = {}
    for term in tokens2:
        tf2[term] = tf2.get(term, 0) + 1
    v2 = [tf2.get(term, 0) * idf[term] for term in vocab]

    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))

    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0

    return round(dot_product / (norm1 * norm2), 3)

def detect_duplicate_candidates(
    new_complaint: Dict[str, Any],
    existing_complaints: List[Dict[str, Any]],
    similarity_threshold: float = 0.45,
    max_distance_km: float = 1.0
) -> List[Dict[str, Any]]:
    """
    Scans existing active complaints against incoming complaint.
    Combines lexical/semantic TF-IDF with geographic proximity.
    """
    candidates = []
    new_text = f"{new_complaint.get('title', '')} {new_complaint.get('description', '')}"
    new_cat = new_complaint.get("category", "")
    new_lat = new_complaint.get("latitude")
    new_lon = new_complaint.get("longitude")

    for existing in existing_complaints:
        if existing.get("id") == new_complaint.get("id"):
            continue

        existing_text = f"{existing.get('title', '')} {existing.get('description', '')}"
        existing_cat = existing.get("category", "")
        existing_lat = existing.get("latitude")
        existing_lon = existing.get("longitude")

        # 1. Category check
        category_match = (new_cat == existing_cat)
        related_cats = {
            "Waterlogging": ["Drainage", "Road Damage"],
            "Drainage": ["Waterlogging", "Water Supply"],
            "Road Damage": ["Waterlogging", "Public Safety"],
            "Streetlight Issues": ["Public Safety"]
        }
        is_related = category_match or (existing_cat in related_cats.get(new_cat, []))
        if not is_related:
            continue

        # 2. Distance check
        dist_km = haversine_distance_km(new_lat, new_lon, existing_lat, existing_lon)
        if dist_km > max_distance_km:
            continue

        # 3. TF-IDF Text Similarity
        sim_score = compute_tf_idf_cosine_similarity(new_text, existing_text)

        # Multi-factor score combining semantic similarity and spatial proximity
        # Closer distance increases confidence
        geo_proximity_boost = 0.0
        if dist_km <= 0.15:  # within 150 meters
            geo_proximity_boost = 0.35 if category_match else 0.25
        elif dist_km <= 0.4: # within 400 meters
            geo_proximity_boost = 0.25 if category_match else 0.15
        elif dist_km <= 0.8: # within 800 meters
            geo_proximity_boost = 0.15 if category_match else 0.08

        combined_score = min(0.99, round(sim_score + geo_proximity_boost, 2))

        if combined_score >= similarity_threshold:
            dist_desc = f"{int(dist_km * 1000)} meters away" if dist_km < 1.0 else f"{dist_km:.2f} km away"
            reason = (
                f"Matched existing report '{existing.get('tracking_id')}' in category '{existing_cat}' "
                f"located {dist_desc} with {int(combined_score * 100)}% composite similarity "
                f"({int(sim_score * 100)}% lexical match)."
            )
            
            candidates.append({
                "matched_complaint_id": existing["id"],
                "matched_tracking_id": existing.get("tracking_id", f"ID-{existing['id']}"),
                "matched_title": existing.get("title", ""),
                "similarity_score": combined_score,
                "distance_km": dist_km,
                "reason": reason,
                "status": "Pending"
            })

    candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
    return candidates
