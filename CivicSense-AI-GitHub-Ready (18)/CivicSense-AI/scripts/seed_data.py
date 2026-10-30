import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Ensure backend directory is in python path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from app.database.session import SessionLocal, Base, engine
from app.models.department import Department
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.duplicate_candidate import DuplicateCandidate
from app.models.admin_user import AdminUser
from app.routes.departments import seed_default_departments
from app.routes.auth import ensure_default_admin
from app.ai import run_ai_pipeline

# 40 Realistic synthetic complaints in Bengaluru (lat: 12.90 - 13.04, lon: 77.52 - 77.72)
# With deliberate duplicate pairs, safety critical events, hotspots, and various lifecycle statuses
SEED_COMPLAINTS = [
    # --- HOTSPOT 1: Koramangala 80ft Road & Sony World (Waterlogging, Drainage, Road Damage) ---
    {
        "tracking_id": "CS-2026-KOR01",
        "title": "Knee-deep waterlogging near Sony World Junction",
        "description": "Heavy stormwater accumulation after rainfall. Pedestrians unable to cross and several 2-wheelers skidding.",
        "category": "Waterlogging",
        "address": "80 Feet Road, 4th Block, Koramangala, Bengaluru",
        "latitude": 12.9345,
        "longitude": 77.6265,
        "status": "In Progress",
        "dept_code": "DRN-OPS",
        "days_ago": 3
    },
    {
        "tracking_id": "CS-2026-KOR02",
        "title": "Severe water stagnation at Koramangala 80 Feet Road",
        "description": "Massive standing water near Sony World signal. Vehicles getting stuck in water and commuters stranded.",
        "category": "Waterlogging",
        "address": "Near Sony World Signal, 80 Feet Road, Koramangala, Bengaluru",
        "latitude": 12.9348,
        "longitude": 77.6269,
        "status": "Under Review",
        "dept_code": "DRN-OPS",
        "days_ago": 2
    }, # Deliberate duplicate candidate to KOR01!
    {
        "tracking_id": "CS-2026-KOR03",
        "title": "Overflowing stormwater drain near Koramangala 4th Block",
        "description": "The main drain grates are clogged with plastic waste. Dark sewage water spilling onto the pedestrian footpath.",
        "category": "Drainage",
        "address": "4th Cross, 4th Block Koramangala, Bengaluru",
        "latitude": 12.9339,
        "longitude": 77.6258,
        "status": "Assigned",
        "dept_code": "DRN-OPS",
        "days_ago": 4
    },
    {
        "tracking_id": "CS-2026-KOR04",
        "title": "Multiple deep potholes near Koramangala BDA Complex",
        "description": "Tar has eroded completely leaving 3 deep craters. Vehicles swerving dangerously during rush hour.",
        "category": "Road Damage",
        "address": "Near BDA Complex, 3rd Block, Koramangala, Bengaluru",
        "latitude": 12.9325,
        "longitude": 77.6241,
        "status": "In Progress",
        "dept_code": "RD-ENG",
        "days_ago": 5
    },
    {
        "tracking_id": "CS-2026-KOR05",
        "title": "Blocked drainage channel along Maharaja signal",
        "description": "Heavy silt accumulated in culvert causing backflow onto road during evening rains.",
        "category": "Drainage",
        "address": "Maharaja Signal, Koramangala, Bengaluru",
        "latitude": 12.9358,
        "longitude": 77.6282,
        "status": "Submitted",
        "dept_code": "DRN-OPS",
        "days_ago": 1
    },

    # --- HOTSPOT 2: Indiranagar 100 Feet Road & CMH Road (Waste, Streetlights, Potholes) ---
    {
        "tracking_id": "CS-2026-IND01",
        "title": "Massive garbage pile overflowing onto 100 Feet Road sidewalk",
        "description": "Uncollected commercial food waste and plastic debris dumped near commercial junction. Emitting foul odor and blocking walkway.",
        "category": "Waste Management",
        "address": "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        "latitude": 12.9698,
        "longitude": 77.6412,
        "status": "Submitted",
        "dept_code": "SWM-SAN",
        "days_ago": 1
    },
    {
        "tracking_id": "CS-2026-IND02",
        "title": "Commercial garbage dump on footpath 100 Feet Road",
        "description": "Huge rubbish and uncollected trash dumped on sidewalk near 100ft road. Stench is unbearable for pedestrians.",
        "category": "Waste Management",
        "address": "Opposite Starbucks, 100 Feet Road, Indiranagar, Bengaluru",
        "latitude": 12.9702,
        "longitude": 77.6415,
        "status": "Submitted",
        "dept_code": "SWM-SAN",
        "days_ago": 1
    }, # Deliberate duplicate candidate to IND01!
    {
        "tracking_id": "CS-2026-IND03",
        "title": "Flickering and non-functional streetlights on CMH Road",
        "description": "Six consecutive lamp posts are dead from metro pillar 45 to 52. Stretch is completely pitch dark creating safety concerns.",
        "category": "Streetlight Issues",
        "address": "CMH Road, Indiranagar, Bengaluru",
        "latitude": 12.9782,
        "longitude": 77.6438,
        "status": "Assigned",
        "dept_code": "ELEC-LTG",
        "days_ago": 3
    },
    {
        "tracking_id": "CS-2026-IND04",
        "title": "Deep asphalt trench left open without barricade",
        "description": "Utility trench dug across road and left unpaved with sharp gravel edges. Two motorcyclists lost control yesterday.",
        "category": "Road Damage",
        "address": "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        "latitude": 12.9721,
        "longitude": 77.6385,
        "status": "In Progress",
        "dept_code": "RD-ENG",
        "days_ago": 6
    },
    {
        "tracking_id": "CS-2026-IND05",
        "title": "Broken waste bin leaking leachate on 12th Main",
        "description": "Public community bin cracked and rusted at base. Garbage spilling into storm inlet.",
        "category": "Waste Management",
        "address": "12th Main, Indiranagar, Bengaluru",
        "latitude": 12.9715,
        "longitude": 77.6392,
        "status": "Resolved",
        "dept_code": "SWM-SAN",
        "days_ago": 10
    },

    # --- CRITICAL SAFETY CASES ---
    {
        "tracking_id": "CS-2026-SAF01",
        "title": "Live electric wire hanging into standing water near Victoria Hospital",
        "description": "Active spark seen on snapped overhead cable dangling directly into rainwater pool near hospital entrance gate. Severe electrocution danger for patients and emergency staff.",
        "category": "Public Safety",
        "address": "Victoria Hospital Gate 2, Fort Road, Bengaluru",
        "latitude": 12.9632,
        "longitude": 77.5755,
        "status": "Under Review",
        "dept_code": "SAF-CIVIC",
        "days_ago": 0
    }, # Top Critical safety demonstration case!
    {
        "tracking_id": "CS-2026-SAF02",
        "title": "Uncovered deep sewer manhole on school transit route",
        "description": "Cast iron lid missing from 8-foot deep sewer manhole directly opposite National Public School. Completely unbarricaded.",
        "category": "Public Safety",
        "address": "Near National Public School, Rajajinagar, Bengaluru",
        "latitude": 12.9924,
        "longitude": 77.5532,
        "status": "Assigned",
        "dept_code": "SAF-CIVIC",
        "days_ago": 1
    },
    {
        "tracking_id": "CS-2026-SAF03",
        "title": "Large tree branch cracked and hanging over primary school bus bay",
        "description": "Heavy gulmohar bough split during thunder storm. Supported only by telephone wires above children boarding zone.",
        "category": "Public Safety",
        "address": "10th Cross, Malleshwaram, Bengaluru",
        "latitude": 13.0031,
        "longitude": 77.5684,
        "status": "In Progress",
        "dept_code": "SAF-CIVIC",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-SAF04",
        "title": "Sudden roadbed sinkhole opening up on Hosur Main Road",
        "description": "Asphalt collapsed over water pipeline creating a 4-foot sinkhole. Approaching vehicles hitting brakes abruptly.",
        "category": "Road Damage",
        "address": "Near Madiwala Police Station, Hosur Road, Bengaluru",
        "latitude": 12.9221,
        "longitude": 77.6189,
        "status": "Under Review",
        "dept_code": "RD-ENG",
        "days_ago": 0
    },

    # --- HOTSPOT 3: Whitefield IT Corridor (Water Supply & Road Infrastructure) ---
    {
        "tracking_id": "CS-2026-WHI01",
        "title": "Major potable water pipeline burst gushing across ITPL Main Road",
        "description": "Main feeder line ruptured. High pressure drinking water flooding street and depleting pressure across residential towers.",
        "category": "Water Supply",
        "address": "ITPL Main Road, Whitefield, Bengaluru",
        "latitude": 12.9862,
        "longitude": 77.7295,
        "status": "In Progress",
        "dept_code": "WSS-BWSSB",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-WHI02",
        "title": "Underground pipe rupture flooding road near ITPL",
        "description": "Massive pipeline leak gushing thousands of liters of clean water onto road. Low pressure in surrounding apartments.",
        "category": "Water Supply",
        "address": "Opposite Prestige Shantiniketan, Whitefield, Bengaluru",
        "latitude": 12.9865,
        "longitude": 77.7291,
        "status": "Assigned",
        "dept_code": "WSS-BWSSB",
        "days_ago": 1
    }, # Deliberate duplicate candidate to WHI01!
    {
        "tracking_id": "CS-2026-WHI03",
        "title": "Severe road craters near Hope Farm Junction",
        "description": "Monsoon rain washed away top bitumen layer. Heavy truck movement causing massive traffic backup.",
        "category": "Road Damage",
        "address": "Hope Farm Junction, Whitefield, Bengaluru",
        "latitude": 12.9839,
        "longitude": 77.7512,
        "status": "Submitted",
        "dept_code": "RD-ENG",
        "days_ago": 3
    },
    {
        "tracking_id": "CS-2026-WHI04",
        "title": "Turbid brown contaminated tap water supply in Kadugodi",
        "description": "Sewage intrusion suspected in municipal line. Water from tap contains dark sediment and sewage odor.",
        "category": "Water Supply",
        "address": "Kadugodi Main Road, Whitefield, Bengaluru",
        "latitude": 12.9984,
        "longitude": 77.7588,
        "status": "Under Review",
        "dept_code": "WSS-BWSSB",
        "days_ago": 4
    },
    {
        "tracking_id": "CS-2026-WHI05",
        "title": "Broken storm drain slab causing bike tire entrapment",
        "description": "Concrete cover over side drain collapsed under car wheel. Open gap catches motorcycle wheels.",
        "category": "Drainage",
        "address": "ECC Road, Whitefield, Bengaluru",
        "latitude": 12.9712,
        "longitude": 77.7423,
        "status": "Assigned",
        "dept_code": "DRN-OPS",
        "days_ago": 5
    },

    # --- HOTSPOT 4: HSR Layout Sector 1 & Outer Ring Road (Waterlogging & Drainage) ---
    {
        "tracking_id": "CS-2026-HSR01",
        "title": "Submerged street and basement flooding near HSR 27th Main",
        "description": "Knee-deep stormwater trapped due to blocked culvert. Water entering ground-floor parking areas and shops.",
        "category": "Waterlogging",
        "address": "27th Main Road, Sector 1, HSR Layout, Bengaluru",
        "latitude": 12.9125,
        "longitude": 77.6495,
        "status": "In Progress",
        "dept_code": "DRN-OPS",
        "days_ago": 3
    },
    {
        "tracking_id": "CS-2026-HSR02",
        "title": "Open drain overflowing onto Agara Lake perimeter road",
        "description": "Black sewage overflowing from stormwater diversion channel. Stench spread over entire residential pocket.",
        "category": "Drainage",
        "address": "Near Agara Lake Gate, HSR Layout, Bengaluru",
        "latitude": 12.9210,
        "longitude": 77.6450,
        "status": "Under Review",
        "dept_code": "DRN-OPS",
        "days_ago": 4
    },
    {
        "tracking_id": "CS-2026-HSR03",
        "title": "Streetlight feeder pillar open with naked junction box",
        "description": "Steel door of electrical control box knocked off. Wires exposed at ground level right near park pathway.",
        "category": "Streetlight Issues",
        "address": "14th Main, Sector 3, HSR Layout, Bengaluru",
        "latitude": 12.9102,
        "longitude": 77.6391,
        "status": "Assigned",
        "dept_code": "ELEC-LTG",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-HSR04",
        "title": "Illegal debris and construction rubble blocking lane",
        "description": "Dozens of cement sacks and broken tiles dumped on public right of way, restricting access to emergency vehicles.",
        "category": "Waste Management",
        "address": "19th Main, Sector 4, HSR Layout, Bengaluru",
        "latitude": 12.9168,
        "longitude": 77.6345,
        "status": "Submitted",
        "dept_code": "SWM-SAN",
        "days_ago": 1
    },

    # --- JAYANAGAR & JP NAGAR (Various Civic Issues) ---
    {
        "tracking_id": "CS-2026-JAY01",
        "title": "Broken pavement tiles creating tripping hazard near Metro station",
        "description": "Paving stones dislodged outside Jayanagar 4th Block metro. Elderly commuters tripping daily.",
        "category": "Road Damage",
        "address": "4th Block Metro Station, Jayanagar, Bengaluru",
        "latitude": 12.9298,
        "longitude": 77.5815,
        "status": "Resolved",
        "dept_code": "RD-ENG",
        "days_ago": 14
    },
    {
        "tracking_id": "CS-2026-JAY02",
        "title": "Flickering sodium streetlights at South End Circle",
        "description": "Lamp assembly strobing intermittently causing visual discomfort to night drivers.",
        "category": "Streetlight Issues",
        "address": "South End Circle, Jayanagar, Bengaluru",
        "latitude": 12.9372,
        "longitude": 77.5794,
        "status": "Resolved",
        "dept_code": "ELEC-LTG",
        "days_ago": 12
    },
    {
        "tracking_id": "CS-2026-JAY03",
        "title": "Water pipeline leakage creating road slush near 9th Block",
        "description": "Clean potable water leaking continuously from underground joint, eroding new tar.",
        "category": "Water Supply",
        "address": "9th Block, Jayanagar, Bengaluru",
        "latitude": 12.9205,
        "longitude": 77.5921,
        "status": "Assigned",
        "dept_code": "WSS-BWSSB",
        "days_ago": 5
    },
    {
        "tracking_id": "CS-2026-JPN01",
        "title": "Gutter overflow flooding Sarakki Market street",
        "description": "Commercial vegetable waste choking underground line. Sewage water ponding in market lane.",
        "category": "Drainage",
        "address": "Sarakki Main Road, JP Nagar 1st Phase, Bengaluru",
        "latitude": 12.9085,
        "longitude": 77.5862,
        "status": "In Progress",
        "dept_code": "DRN-OPS",
        "days_ago": 4
    },

    # --- MALLESHWARAM & RAJAJINAGAR ---
    {
        "tracking_id": "CS-2026-MAL01",
        "title": "Heritage stone footpath damaged by JCB excavation",
        "description": "Contractor trenching left granite slabs shattered along 8th Cross commercial market.",
        "category": "Road Damage",
        "address": "8th Cross, Malleshwaram, Bengaluru",
        "latitude": 13.0045,
        "longitude": 77.5710,
        "status": "Under Review",
        "dept_code": "RD-ENG",
        "days_ago": 3
    },
    {
        "tracking_id": "CS-2026-MAL02",
        "title": "Streetlight pole tilted 30 degrees after delivery truck collision",
        "description": "Heavy steel lighting pole leaning precariously over sidewalk. Cable tension holding it from falling.",
        "category": "Streetlight Issues",
        "address": "Margosa Road, Malleshwaram, Bengaluru",
        "latitude": 13.0012,
        "longitude": 77.5702,
        "status": "In Progress",
        "dept_code": "ELEC-LTG",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-RAJ01",
        "title": "Blackout on Industrial Town main corridor",
        "description": "All 18 streetlights unlit from entrance arch to railway underpass. Industrial workers walking in total darkness.",
        "category": "Streetlight Issues",
        "address": "Industrial Town, Rajajinagar, Bengaluru",
        "latitude": 12.9912,
        "longitude": 77.5489,
        "status": "Assigned",
        "dept_code": "ELEC-LTG",
        "days_ago": 4
    },

    # --- HEBBAL & NORTH BENGALURU ---
    {
        "tracking_id": "CS-2026-HEB01",
        "title": "Flyover down-ramp stormwater drain choked with leaves",
        "description": "Heavy water accumulation at bottom of Hebbal flyover slip road. Vehicles braking rapidly creating collision hazard.",
        "category": "Waterlogging",
        "address": "Hebbal Flyover Junction, Bellary Road, Bengaluru",
        "latitude": 13.0358,
        "longitude": 77.5971,
        "status": "In Progress",
        "dept_code": "DRN-OPS",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-HEB02",
        "title": "Illegal slaughterhouse waste dumped in dry stormwater canal",
        "description": "Organic animal waste discarded into open canal bed. Pungent odor and stray dog congregation.",
        "category": "Waste Management",
        "address": "Kempapura Main Road, Hebbal, Bengaluru",
        "latitude": 13.0421,
        "longitude": 77.6045,
        "status": "Submitted",
        "dept_code": "SWM-SAN",
        "days_ago": 1
    },

    # --- MG ROAD & SHIVAJINAGAR (Central Business District) ---
    {
        "tracking_id": "CS-2026-MGR01",
        "title": "Broken cast iron tree grate on MG Road boulevard",
        "description": "Heavy ornamental grate fractured. Dangerous 5-inch hole right on busy pedestrian walkway near Metro.",
        "category": "Public Safety",
        "address": "MG Road Boulevard, Bengaluru",
        "latitude": 12.9751,
        "longitude": 77.6094,
        "status": "Resolved",
        "dept_code": "SAF-CIVIC",
        "days_ago": 8
    },
    {
        "tracking_id": "CS-2026-MGR02",
        "title": "Sewage backflow in Commercial Street shopping alley",
        "description": "Underground sewer line choked during peak shopping hours. Foul water seeping into shop entrances.",
        "category": "Drainage",
        "address": "Commercial Street, Tasker Town, Bengaluru",
        "latitude": 12.9822,
        "longitude": 77.6081,
        "status": "Resolved",
        "dept_code": "DRN-OPS",
        "days_ago": 9
    },

    # --- ELECTRONIC CITY & SOUTH CORRIDOR ---
    {
        "tracking_id": "CS-2026-ELC01",
        "title": "Severe road cratering near Phase 1 toll plaza",
        "description": "Heavy asphalt disintegration over 50 meters before elevated expressway ramp.",
        "category": "Road Damage",
        "address": "Electronic City Phase 1, Hosur Road, Bengaluru",
        "latitude": 12.8451,
        "longitude": 77.6621,
        "status": "Assigned",
        "dept_code": "RD-ENG",
        "days_ago": 5
    },
    {
        "tracking_id": "CS-2026-ELC02",
        "title": "No municipal water supply for 4 consecutive days in Doddathoguru",
        "description": "Feeder pump failure reported. Over 400 households dependent on private tankers at exorbitant rates.",
        "category": "Water Supply",
        "address": "Doddathoguru Main Road, Electronic City, Bengaluru",
        "latitude": 12.8489,
        "longitude": 77.6542,
        "status": "In Progress",
        "dept_code": "WSS-BWSSB",
        "days_ago": 4
    },
    {
        "tracking_id": "CS-2026-ELC03",
        "title": "Burned transformer pole sparking near tech park entrance",
        "description": "Continuous buzzing and periodic orange sparks from pole mounted transformer during load surge.",
        "category": "Public Safety",
        "address": "Velankani Drive, Electronic City Phase 1, Bengaluru",
        "latitude": 12.8512,
        "longitude": 77.6689,
        "status": "Assigned",
        "dept_code": "SAF-CIVIC",
        "days_ago": 1
    },

    # --- OTHER GENERAL CIVIC CASES ---
    {
        "tracking_id": "CS-2026-OTH01",
        "title": "Unregulated sound pollution from unauthorized diesel generator",
        "description": "Heavy industrial generator operated in quiet residential zone all night exceeding decibel limits.",
        "category": "Other",
        "address": "Banashankari 2nd Stage, Bengaluru",
        "latitude": 12.9245,
        "longitude": 77.5612,
        "status": "Submitted",
        "dept_code": "SAF-CIVIC",
        "days_ago": 2
    },
    {
        "tracking_id": "CS-2026-OTH02",
        "title": "Stray cattle causing daily traffic hazard on ring road",
        "description": "Unattended cattle herd blocking outer lane of arterial ring road during peak morning traffic.",
        "category": "Other",
        "address": "Outer Ring Road near Nagarbhavi, Bengaluru",
        "latitude": 12.9610,
        "longitude": 77.5120,
        "status": "Resolved",
        "dept_code": "SAF-CIVIC",
        "days_ago": 15
    }
]

def seed_database():
    print("Initializing CivicSense AI database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed departments and admin
        seed_default_departments(db)
        ensure_default_admin(db)
        
        departments = {d.code: d for d in db.query(Department).all()}

        print(f"Checking existing complaints...")
        existing_count = db.query(Complaint).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} complaints. Checking for missing items...")
            
        saved_complaints = []
        now = datetime.utcnow()

        # Idempotent seed: check by tracking_id
        for item in SEED_COMPLAINTS:
            existing = db.query(Complaint).filter(Complaint.tracking_id == item["tracking_id"]).first()
            if existing:
                saved_complaints.append(existing)
                continue

            created_time = now - timedelta(days=item.get("days_ago", 1), hours=item.get("days_ago", 1) * 2)

            # AI Pipeline execution
            existing_for_ai = [
                {
                    "id": c.id,
                    "tracking_id": c.tracking_id,
                    "title": c.title,
                    "description": c.description,
                    "category": c.category,
                    "status": c.status,
                    "latitude": c.latitude,
                    "longitude": c.longitude
                }
                for c in saved_complaints
            ]

            ai_res = run_ai_pipeline(
                title=item["title"],
                description=item["description"],
                category=item["category"],
                address=item["address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                existing_complaints=existing_for_ai
            )

            dept = departments.get(item.get("dept_code"))

            complaint = Complaint(
                tracking_id=item["tracking_id"],
                title=item["title"],
                description=item["description"],
                category=item["category"],
                address=item["address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                status=item["status"],
                department_id=dept.id if dept else None,
                priority=ai_res["priority"],
                priority_score=ai_res["priority_score"],
                priority_explanation=ai_res["priority_explanation"],
                priority_factors=ai_res["priority_factors"],
                ai_summary=ai_res["ai_summary"],
                ai_predicted_category=ai_res["predicted_category"],
                ai_analysis_method="Hybrid AI Engine",
                created_at=created_time,
                updated_at=created_time + timedelta(hours=3)
            )

            db.add(complaint)
            db.commit()
            db.refresh(complaint)
            saved_complaints.append(complaint)

            # Build realistic status history progression
            # Submitted -> (Under Review) -> (Assigned) -> (In Progress) -> (Resolved)
            status_lifecycle = ["Submitted"]
            if complaint.status in ["Under Review", "Assigned", "In Progress", "Resolved"]:
                status_lifecycle.append("Under Review")
            if complaint.status in ["Assigned", "In Progress", "Resolved"]:
                status_lifecycle.append("Assigned")
            if complaint.status in ["In Progress", "Resolved"]:
                status_lifecycle.append("In Progress")
            if complaint.status == "Resolved":
                status_lifecycle.append("Resolved")

            prev_stat = None
            step_time = created_time
            for stat in status_lifecycle:
                note = f"Complaint transitioned to {stat}."
                if stat == "Submitted":
                    note = "Citizen complaint registered via mobile civic reporting portal."
                elif stat == "Under Review":
                    note = "Automated AI triaging verified. Dispatched to zonal officer review queue."
                elif stat == "Assigned":
                    note = f"Allocated to {dept.name if dept else 'Civic Operations'} field team."
                elif stat == "In Progress":
                    note = "Field inspection and maintenance crew deployed on site."
                elif stat == "Resolved":
                    note = "Civic remediation executed and validated by municipal engineer."

                history = StatusHistory(
                    complaint_id=complaint.id,
                    previous_status=prev_stat,
                    new_status=stat,
                    changed_by="Civic Operations Officer" if stat != "Submitted" else "Citizen Portal",
                    notes=note,
                    is_public=True,
                    created_at=step_time
                )
                db.add(history)
                prev_stat = stat
                step_time += timedelta(hours=4)

            # Save duplicate candidate links if detected
            if ai_res.get("duplicate_candidates"):
                for cand in ai_res["duplicate_candidates"]:
                    cand_entry = DuplicateCandidate(
                        complaint_id=complaint.id,
                        matched_complaint_id=cand["matched_complaint_id"],
                        similarity_score=cand["similarity_score"],
                        distance_km=cand["distance_km"],
                        reason=cand["reason"],
                        status="Pending"
                    )
                    db.add(cand_entry)

            db.commit()

        total = db.query(Complaint).count()
        print(f"Successfully seeded database! Total complaints in DB: {total}")
        
        # Verify duplicate candidates count
        dup_count = db.query(DuplicateCandidate).count()
        print(f"Detected duplicate candidate linkages: {dup_count}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
