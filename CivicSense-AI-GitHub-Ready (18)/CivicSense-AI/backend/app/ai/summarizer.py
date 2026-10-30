import re
from typing import Optional

IMPACT_PATTERNS = [
    (r"(unable to walk|cannot walk|hard to cross|pedestrian.*stuck)", "obstructing pedestrian transit"),
    (r"(vehicle.*stuck|car.*stuck|bike.*skid|traffic.*jam|traffic.*slow)", "disrupting vehicular traffic"),
    (r"(hospital|school|clinic|elderly|children)", "affecting sensitive local institutions"),
    (r"(foul smell|bad odor|stink|health hazard|disease)", "causing hygiene and environmental concerns"),
    (r"(dark|night|unsafe|theft|snatching|cannot see)", "compromising nighttime safety"),
    (r"(accident|fall|injury|slip|risk)", "posing heightened safety risks to commuters"),
    (r"(spark|electric shock|short circuit|current)", "creating active electrical hazard"),
    (r"(overflowing|flooded home|entered house|entering compound)", "inundating surrounding residential areas"),
    (r"(water shortage|no water for \d+ days|tanker)", "disrupting essential civic water access")
]

SEVERITY_MODIFIERS = [
    (r"(huge|massive|severe|deep|knee deep|heavy|terrible|urgent|critical|worst)", "Severe"),
    (r"(broken|damaged|overflowing|blocked|clogged|leaking|flickering)", "Reported"),
    (r"(small|minor|slight)", "Localized")
]

def generate_actionable_summary(title: str, description: str, category: str, address: Optional[str] = None) -> str:
    """
    Synthesizes unstructured citizen descriptions into concise, 
    factual administrative briefs. Strictly preserves observed facts
    without hallucinating unmentioned emergencies.
    """
    title_clean = title.strip().rstrip('.')
    text = f"{title_clean}. {description.strip()}"
    text_lower = text.lower()

    # Determine severity prefix
    severity_prefix = "Active"
    for pattern, prefix in SEVERITY_MODIFIERS:
        if re.search(pattern, text_lower):
            severity_prefix = prefix
            break

    # Determine core phenomenon based on category and text
    phenomenon = category.lower()
    if category == "Road Damage":
        if "pothole" in text_lower:
            phenomenon = "road pothole cratering"
        elif "sinkhole" in text_lower or "cave in" in text_lower:
            phenomenon = "roadbed cave-in"
        else:
            phenomenon = "road surface deterioration"
    elif category == "Waterlogging":
        phenomenon = "stormwater inundation"
    elif category == "Waste Management":
        phenomenon = "uncollected solid waste accumulation"
    elif category == "Streetlight Issues":
        phenomenon = "public illumination failure"
    elif category == "Water Supply":
        phenomenon = "municipal water supply disruption"
    elif category == "Drainage":
        phenomenon = "drainage backflow and blockage"
    elif category == "Public Safety":
        phenomenon = "civic safety hazard"

    # Identify impact phrases
    impacts = []
    for pattern, impact_desc in IMPACT_PATTERNS:
        if re.search(pattern, text_lower):
            if impact_desc not in impacts:
                impacts.append(impact_desc)

    impact_clause = ""
    if impacts:
        if len(impacts) == 1:
            impact_clause = f", {impacts[0]}"
        else:
            impact_clause = f", {impacts[0]} and {impacts[1]}"

    # Locate landmark if present in text
    location_match = re.search(
        r"(?:near|at|opposite|behind|beside|in front of|around|along)\s+([A-Za-z0-9\s\-]{3,30}?)(?=[,.\n]|\s+(?:and|which|where|with|is|are|causing|due|people|vehicles|traffic|$))",
        text,
        re.IGNORECASE
    )
    
    loc_clause = ""
    if location_match:
        landmark = location_match.group(1).strip()
        loc_clause = f" near {landmark}"
    elif address and address.strip():
        # Use first segment of address
        clean_addr = address.split(",")[0].strip()
        loc_clause = f" at {clean_addr}"

    summary = f"{severity_prefix} {phenomenon}{loc_clause}{impact_clause}."
    
    # Capitalize first letter properly
    return summary[0].upper() + summary[1:]
