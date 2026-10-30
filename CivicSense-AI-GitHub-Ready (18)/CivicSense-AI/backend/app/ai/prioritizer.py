import re
from typing import Dict, Any, List, Optional

# Keywords and scoring heuristics
SAFETY_INDICATORS = [
    (r"(exposed wire|live wire|electric shock|sparking|short circuit|electrocution)", 35, "Active electrical shock hazard"),
    (r"(sinkhole|cave in|collapsed|open manhole|deep pit|trench open)", 32, "Severe pedestrian or vehicle fall hazard"),
    (r"(falling tree|tree branch broken|wall collapse|building crack)", 28, "Structural or physical falling debris hazard"),
    (r"(accident|skidding|vehicle damage|bikes falling|pedestrian hurt)", 25, "Demonstrated commuter safety hazard"),
    (r"(dark road|pitch dark|no lights|women safety|theft|snatching)", 20, "Nighttime commuter and public safety hazard"),
    (r"(contaminated water|foul smell|sewage entering|dengue|health hazard)", 18, "Public health and sanitation hazard")
]

URGENCY_INDICATORS = [
    (r"(urgent|emergency|immediately|critical|asap|within hours)", 25, "Immediate critical timeframe explicitly reported"),
    (r"(burst pipe|pipeline burst|continuous leak|gushing water)", 22, "Ongoing unchecked infrastructure failure"),
    (r"(submerged|water entering home|flooding hospital|stuck ambulance)", 25, "Emergency access obstruction"),
    (r"(traffic blocked|main road blocked|complete jam|highway obstructed)", 20, "Major arterial transit blockage"),
    (r"(since today|started today|fast spreading)", 14, "Rapidly deteriorating recent event")
]

COMMUNITY_IMPACT_INDICATORS = [
    (r"(hospital|clinic|ambulance|emergency ward)", 20, "Proximity to critical medical healthcare facility"),
    (r"(school|college|kindergarten|students|children)", 18, "Educational institution zone with children/students"),
    (r"(main junction|signal|metro station|bus stand|railway station)", 17, "High-density mass transit hub"),
    (r"(hundreds of people|entire layout|whole colony|all residents|dense)", 16, "Wide civic population impact (>100 residents)"),
    (r"(market|commercial street|bazaar|busy street)", 14, "Dense commercial / market district")
]

LOCATION_SENSITIVITY_INDICATORS = [
    (r"(hospital road|near hospital|apollo|fortis|manipal|nimhans|victoria)", 10, "Designated healthcare priority zone"),
    (r"(near school|school road|vidyalaya|public school)", 9, "Designated school safety corridor"),
    (r"(ring road|outer ring road|mg road|hosur road|main road|flyover)", 8, "Primary arterial roadway"),
    (r"(slum|low lying area|lake bed|flood prone zone)", 7, "Vulnerable low-lying drainage zone")
]

def calculate_priority_score(
    title: str,
    description: str,
    category: str,
    address: str = "",
    nearby_complaint_count: int = 0
) -> Dict[str, Any]:
    """
    Computes a transparent 0-100 priority score using the 5-factor weighted model:
    - Safety Risk (max 35)
    - Urgency (max 25)
    - Community Impact (max 20)
    - Repeat Complaints (max 10)
    - Location Sensitivity (max 10)
    """
    full_text = f"{title} {description} {address}".lower()

    # 1. Safety Risk (0 to 35)
    safety_score = 5  # Baseline civic issue baseline
    safety_reasons = []
    for pattern, pts, label in SAFETY_INDICATORS:
        if re.search(pattern, full_text):
            if pts > safety_score:
                safety_score = pts
            safety_reasons.append(label)

    # 2. Urgency (0 to 25)
    urgency_score = 5  # Standard civic request baseline
    urgency_reasons = []
    for pattern, pts, label in URGENCY_INDICATORS:
        if re.search(pattern, full_text):
            if pts > urgency_score:
                urgency_score = pts
            urgency_reasons.append(label)

    # 3. Community Impact (0 to 20)
    impact_score = 6  # Local neighborhood default
    impact_reasons = []
    for pattern, pts, label in COMMUNITY_IMPACT_INDICATORS:
        if re.search(pattern, full_text):
            if pts > impact_score:
                impact_score = pts
            impact_reasons.append(label)

    # 4. Repeated Complaints / Clustering (0 to 10)
    # Scaled by number of prior complaints recorded in this sector
    if nearby_complaint_count >= 5:
        repeat_score = 10
        repeat_reason = f"High cluster recurrence: {nearby_complaint_count} existing reports in immediate area."
    elif nearby_complaint_count >= 2:
        repeat_score = 7
        repeat_reason = f"Recurrent issue: {nearby_complaint_count} correlated reports nearby."
    elif nearby_complaint_count == 1:
        repeat_score = 4
        repeat_reason = "Single prior correlated report in zone."
    else:
        repeat_score = 2
        repeat_reason = "First reported occurrence at location."

    # 5. Location Sensitivity (0 to 10)
    location_score = 2  # Standard residential baseline
    location_reasons = []
    for pattern, pts, label in LOCATION_SENSITIVITY_INDICATORS:
        if re.search(pattern, full_text):
            if pts > location_score:
                location_score = pts
            location_reasons.append(label)

    # Calculate total score normalized to 100
    raw_total = safety_score + urgency_score + impact_score + repeat_score + location_score
    total_score = min(100.0, max(10.0, float(raw_total)))

    # Classification
    if total_score >= 85:
        priority_level = "Critical"
    elif total_score >= 65:
        priority_level = "High"
    elif total_score >= 40:
        priority_level = "Medium"
    else:
        priority_level = "Low"

    # Assemble comprehensive explanation
    explanation_parts = []
    if safety_reasons:
        explanation_parts.append(f"Safety: {safety_reasons[0]}")
    if urgency_reasons:
        explanation_parts.append(f"Urgency: {urgency_reasons[0]}")
    if impact_reasons:
        explanation_parts.append(f"Impact: {impact_reasons[0]}")
    if location_reasons:
        explanation_parts.append(f"Zone: {location_reasons[0]}")
    explanation_parts.append(repeat_reason)

    explanation = (
        f"Assigned {priority_level} priority (Score: {total_score:.1f}/100) based on weighted assessment. "
        + "; ".join(explanation_parts) + "."
    )

    factors = {
        "safety_risk": round(safety_score, 1),
        "urgency": round(urgency_score, 1),
        "community_impact": round(impact_score, 1),
        "repeated_complaints": round(repeat_score, 1),
        "location_sensitivity": round(location_score, 1),
        "total_score": round(total_score, 1)
    }

    return {
        "priority": priority_level,
        "priority_score": round(total_score, 1),
        "priority_explanation": explanation,
        "priority_factors": factors
    }
