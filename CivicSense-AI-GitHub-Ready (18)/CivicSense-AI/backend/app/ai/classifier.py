import re
from typing import Dict, Any, Tuple

CATEGORIES = [
    "Road Damage",
    "Waterlogging",
    "Waste Management",
    "Streetlight Issues",
    "Water Supply",
    "Drainage",
    "Public Safety",
    "Other"
]

KEYWORD_MAP = {
    "Road Damage": [
        "pothole", "potholes", "crater", "broken road", "asphalt", "tar", "road surface",
        "cracked road", "damaged road", "uneven road", "speed breaker", "cave in", "sinkhole",
        "divider broken", "manhole open road", "highway damage", "street damage"
    ],
    "Waterlogging": [
        "waterlog", "waterlogged", "water logging", "flooding", "flooded", "standing water",
        "stagnant water", "water pool", "submerged", "knee deep water", "water accumulated",
        "rain water", "inundated", "water stagnation", "clogged water"
    ],
    "Waste Management": [
        "garbage", "trash", "waste", "debris", "dump", "dumping", "rubbish", "litter",
        "uncollected garbage", "overflowing bin", "smell", "foul odor", "plastic waste",
        "dead animal", "sanitation", "filth", "solid waste", "compost bin broken"
    ],
    "Streetlight Issues": [
        "streetlight", "street light", "lamp post", "dark road", "light not working",
        "broken lamp", "flickering light", "no lights", "pitch dark", "pole broken",
        "wire sparking", "bulb fused", "lighting", "street illumination", "blackout"
    ],
    "Water Supply": [
        "water supply", "drinking water", "no water", "low pressure", "pipe burst",
        "leaking pipe", "pipeline leak", "contaminated water", "muddy water", "dirty water",
        "bwssb", "tap water", "water shortage", "water tanker", "valve leak"
    ],
    "Drainage": [
        "drain", "drainage", "sewage", "gutter", "manhole", "sewer", "clogged drain",
        "overflowing drain", "choked drain", "sewage smell", "open manhole", "storm drain",
        "culvert", "drain cover", "blocked gutter"
    ],
    "Public Safety": [
        "hazard", "safety", "danger", "dangerous", "exposed wire", "electric shock",
        "hanging wire", "falling tree", "collapsed wall", "construction debris", "unsafe",
        "stray dog", "accident prone", "unfenced pit", "gas leak", "structural crack"
    ]
}

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

def classify_complaint(title: str, description: str) -> Dict[str, Any]:
    """
    Analyzes title and description to predict the civic category,
    confidence score, and natural language explanation.
    """
    combined_text = f"{title} {description}".lower()
    cleaned = clean_text(combined_text)
    
    scores = {cat: 0 for cat in CATEGORIES}
    matched_keywords = {cat: [] for cat in CATEGORIES}

    # Weight title occurrences higher (x2)
    title_clean = clean_text(title)
    
    for category, keywords in KEYWORD_MAP.items():
        for kw in keywords:
            # Check title
            if kw in title_clean:
                scores[category] += 3
                if kw not in matched_keywords[category]:
                    matched_keywords[category].append(kw)
            # Check full text
            elif kw in cleaned:
                scores[category] += 1
                if kw not in matched_keywords[category]:
                    matched_keywords[category].append(kw)

    total_score = sum(scores.values())
    
    if total_score == 0:
        return {
            "predicted_category": "Other",
            "confidence": 0.40,
            "explanation": "No specific category keywords detected. Categorized as general civic issue.",
            "method": "Local NLP Rule-Engine",
            "matched_keywords": []
        }

    # Find highest category
    sorted_cats = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_category, best_score = sorted_cats[0]
    
    # Calculate confidence based on lead over second best
    second_score = sorted_cats[1][1] if len(sorted_cats) > 1 else 0
    margin = best_score - second_score
    
    confidence = min(0.95, round(0.55 + (best_score / (total_score + 2)) * 0.3 + (margin * 0.05), 2))
    
    top_kws = matched_keywords[best_category][:4]
    kw_str = ", ".join([f"'{k}'" for k in top_kws]) if top_kws else "contextual phrases"
    explanation = (
        f"Classified as '{best_category}' with {int(confidence * 100)}% confidence "
        f"based on key civic indicators: {kw_str}."
    )

    return {
        "predicted_category": best_category,
        "confidence": confidence,
        "explanation": explanation,
        "method": "Local NLP Rule-Engine",
        "matched_keywords": top_kws
    }
