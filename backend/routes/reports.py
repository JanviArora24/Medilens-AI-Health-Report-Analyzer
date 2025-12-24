from fastapi import APIRouter, Depends
from lib.mongodb import reports_collection
from dependencies.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_reports(user_id: str = Depends(get_current_user)):
    reports = list(
        reports_collection.find({"user_id": user_id}).sort("uploaded_at", -1)
    )

    for r in reports:
        r["_id"] = str(r["_id"])

    return reports
