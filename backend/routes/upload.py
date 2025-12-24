from fastapi import APIRouter, UploadFile, File, Form, Depends
from lib.mongodb import reports_collection
from services.pdf_parser import extract_text
from services.gemini_ai import analyze_report
from services.test_extractor import extract_tests
from datetime import datetime
from dependencies.auth import get_current_user
import shutil, os

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    language: str = Form(...),
    user_id: str = Depends(get_current_user)   # 🔐 JWT
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text(file_path)

    summary = "Report uploaded successfully. Analysis unavailable."
    try:
        summary = analyze_report(text, language)
    except Exception as e:
        print("Gemini error:", e)

    tests = extract_tests(summary)

    report_doc = {
        "user_id": user_id,                     # 🔐 LINK USER
        "filename": file.filename,
        "uploaded_at": datetime.utcnow(),
        "summary": summary,
        "tests": tests,
        "language": language
    }

    result = reports_collection.insert_one(report_doc)

    return {
        "report_id": str(result.inserted_id),
        "summary": summary,
        "tests": tests
    }
