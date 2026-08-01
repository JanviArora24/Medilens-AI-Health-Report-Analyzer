from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from lib.mongodb import reports_collection
from dependencies.auth import get_current_user
from services.gemini_ai import analyze_report
from services.test_extractor import extract_tests

router = APIRouter()

# 🟢 MY REPORTS (list page)
@router.get("/my")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    reports = reports_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("updated_at", -1)

    return [
        {
            "id": str(r["_id"]),
            "report_name": r["report_name"],
            "summary": r["summary"],
            "language": r["language"],
            "created_at": r["created_at"],
            "updated_at": r.get("updated_at")
        }
        for r in reports
    ]


# 🔵 VIEW DETAILS (single report)
@router.get("/{report_id}")
async def get_report_details(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report id")

    report = reports_collection.find_one({
        "_id": ObjectId(report_id),
        "user_id": current_user["_id"]
    })

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": str(report["_id"]),
        "report_name": report["report_name"],
        "summary": report["summary"],
        "tests": report.get("tests", []),
        "language": report["language"],
        "created_at": report["created_at"],
        "updated_at": report.get("updated_at")
    }


# 🔁 RE-ANALYZE PAST REPORT (NEW — PHASE 3)
@router.post("/{report_id}/reanalyze")
async def reanalyze_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report id")

    report = reports_collection.find_one({
        "_id": ObjectId(report_id),
        "user_id": current_user["_id"]
    })

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    extracted_text = report.get("extracted_text")
    language = report.get("language", "english")

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No extracted text found for this report"
        )

    # 🧠 Fresh AI call
    new_summary = analyze_report(extracted_text, language)
    new_tests = extract_tests(new_summary)

    reports_collection.update_one(
        {"_id": report["_id"]},
        {
            "$set": {
                "summary": new_summary,
                "tests": new_tests,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {
        "message": "Report re-analyzed successfully",
        "summary": new_summary,
        "tests": new_tests
    }
