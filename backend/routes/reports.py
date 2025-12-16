from fastapi import APIRouter
from lib.mongodb import reports_collection

router = APIRouter()

@router.get("/")
async def get_reports():
    reports = list(reports_collection.find().sort("uploaded_at", -1))
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports
