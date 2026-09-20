from app.db.session import SessionLocal
from app.services.competency_gap_service import get_competency_gaps


db = SessionLocal()

try:
    for official_id in ["OFF001", "OFF002", "OFF003"]:
        print(f"\n===== {official_id} =====")

        gaps = get_competency_gaps(db, official_id)

        for item in gaps:
            print(
                f"{item['competency_name']}: "
                f"required={item['required_level']}, "
                f"current={item['current_level']}, "
                f"gap={item['gap']}, "
                f"status={item['gap_status']}"
            )

finally:
    db.close()