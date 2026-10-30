from typing import List, Dict, Any
from collections import Counter
from app.ai.duplicate_detector import haversine_distance_km

def detect_hotspots(
    complaints: List[Dict[str, Any]],
    radius_km: float = 1.0,
    min_complaints: int = 3
) -> List[Dict[str, Any]]:
    """
    Groups complaints by geographic spatial proximity to detect infrastructure hotspots.
    Identifies multi-category civic stress clusters and produces operational action briefs.
    """
    valid_complaints = [
        c for c in complaints 
        if c.get("latitude") is not None and c.get("longitude") is not None
    ]

    if not valid_complaints:
        return []

    visited = set()
    clusters = []

    for i, base in enumerate(valid_complaints):
        if base["id"] in visited:
            continue

        cluster_members = [base]
        for j, candidate in enumerate(valid_complaints):
            if i == j or candidate["id"] in visited:
                continue

            dist = haversine_distance_km(
                base["latitude"], base["longitude"],
                candidate["latitude"], candidate["longitude"]
            )
            if dist <= radius_km:
                cluster_members.append(candidate)

        if len(cluster_members) >= min_complaints:
            # Mark all as visited in this cluster
            for member in cluster_members:
                visited.add(member["id"])
            clusters.append(cluster_members)

    hotspots = []
    priority_rank = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}

    for idx, members in enumerate(clusters):
        count = len(members)
        avg_lat = sum(m["latitude"] for m in members) / count
        avg_lon = sum(m["longitude"] for m in members) / count

        # Category distribution
        categories = [m.get("category", "Other") for m in members]
        cat_counts = Counter(categories)
        dominant_category = cat_counts.most_common(1)[0][0]
        related_cats = [cat for cat, _ in cat_counts.most_common() if cat != dominant_category]

        # Highest priority
        highest_prio = "Low"
        highest_prio_val = 1
        for m in members:
            prio = m.get("priority", "Low")
            if priority_rank.get(prio, 1) > highest_prio_val:
                highest_prio_val = priority_rank.get(prio, 1)
                highest_prio = prio

        # Extract address anchor
        # Find the most descriptive address among members
        best_addr = members[0].get("address", f"Cluster Zone {idx + 1}")
        clean_zone = best_addr.split(",")[0].strip()

        # Extract common problem keywords
        common_words = []
        titles = " ".join([m.get("title", "") for m in members]).lower()
        key_themes = ["waterlogging", "drainage", "pothole", "garbage", "streetlight", "pipeline", "traffic", "sewage", "flooding"]
        for theme in key_themes:
            if theme in titles:
                common_words.append(theme.capitalize())

        # Generate action brief
        cat_summary = f"{cat_counts[dominant_category]} {dominant_category}"
        if related_cats:
            extra = [f"{cat_counts[c]} {c}" for c in related_cats[:2]]
            cat_summary += f", accompanied by {', '.join(extra)}"

        investigation_suggestion = "Inspect storm runoff channels and sub-surface drainage network."
        if dominant_category == "Road Damage":
            investigation_suggestion = "Dispatch road engineering unit for immediate asphalt cold-mix patching and sub-base stability test."
        elif dominant_category == "Waste Management":
            investigation_suggestion = "Coordinate with solid waste division for mechanized bin clearance and establish daily collection monitoring."
        elif dominant_category == "Streetlight Issues":
            investigation_suggestion = "Audit feeder pillar circuit and replace burned sodium/LED bulbs along the corridor."
        elif dominant_category == "Waterlogging" or "Drainage" in related_cats:
            investigation_suggestion = "Clear stormwater drain grates, desilt arterial culverts, and inspect pump station throughput."

        action_brief = (
            f"Concentration of {count} active civic reports detected within a {radius_km}km radius around {clean_zone}. "
            f"Pattern shows {cat_summary}. Highest recorded urgency is {highest_prio}. "
            f"Suggested field investigation: {investigation_suggestion}"
        )

        hotspots.append({
            "id": f"HS-{idx + 1}",
            "location_name": clean_zone,
            "latitude": round(avg_lat, 5),
            "longitude": round(avg_lon, 5),
            "complaint_count": count,
            "dominant_category": dominant_category,
            "highest_priority": highest_prio,
            "related_categories": list(cat_counts.keys()),
            "common_issues": common_words if common_words else [dominant_category],
            "action_brief": action_brief,
            "complaint_ids": [m["id"] for m in members]
        })

    # Sort hotspots by complaint count descending
    hotspots.sort(key=lambda x: x["complaint_count"], reverse=True)
    return hotspots
