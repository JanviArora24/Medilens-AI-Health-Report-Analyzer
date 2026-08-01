from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from lib.mongodb import reports_collection
from services.pdf_parser import extract_text, extract_report_date
from services.gemini_ai import analyze_report
from services.test_extractor import extract_tests
from dependencies.auth import get_current_user

from datetime import datetime
import shutil
import hashlib
import uuid
import os

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------------------------------------
# SHA256 HASH
# -------------------------------------------------------

def calculate_file_hash(file_path: str):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:

        for chunk in iter(lambda: f.read(4096), b""):

            sha256.update(chunk)

    return sha256.hexdigest()


# -------------------------------------------------------
# UPLOAD REPORT
# -------------------------------------------------------

@router.post("/upload")
async def upload_report(

    file: UploadFile = File(...),

    language: str = Form(...),

    current_user: dict = Depends(get_current_user)

):

    allowed_extensions = [

        ".pdf",

        ".png",

        ".jpg",

        ".jpeg"

    ]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(

            status_code=400,

            detail="Only PDF, PNG, JPG and JPEG files are supported."

        )

    # -------------------------------------------------------
    # UNIQUE TEMP FILE
    # -------------------------------------------------------

    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(

        UPLOAD_DIR,

        unique_filename

    )

    try:

        # -------------------------------------------------------
        # SAVE FILE
        # -------------------------------------------------------

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(file.file, buffer)

        # -------------------------------------------------------
        # HASH
        # -------------------------------------------------------

        file_hash = calculate_file_hash(file_path)

        # -------------------------------------------------------
        # DUPLICATE CHECK
        # -------------------------------------------------------

        existing = reports_collection.find_one({

            "user_id": current_user["_id"],

            "file_hash": file_hash,

            "language": language

        })

        if existing:

            reports_collection.update_one(

                {

                    "_id": existing["_id"]

                },

                {

                    "$set": {

                        "updated_at": datetime.utcnow()

                    }

                }

            )

            return {

                "report_id": str(existing["_id"]),

                "summary": existing["summary"],

                "tests": existing["tests"],

                "reused": True

            }

        # -------------------------------------------------------
        # OCR / TEXT EXTRACTION
        # -------------------------------------------------------

        extracted_text = extract_text(file_path)

        print("\n========== OCR TEXT ==========\n")

        print(extracted_text[:3000])

        print("\n==============================\n")

        print("Text Length :", len(extracted_text))

        print("\n========== FIRST 1000 CHARACTERS ==========\n")
        print(extracted_text[:1000])
        print("\n===========================================\n")

        # -------------------------------------------------------
        # VALIDATION
        # -------------------------------------------------------

        if not extracted_text.strip():

            raise HTTPException(

                status_code=400,

                detail="Unable to extract text from the uploaded report."

            )

        # -------------------------------------------------------
        # REPORT DATE
        # -------------------------------------------------------

        report_date = extract_report_date(

            extracted_text

        )

        print("Report Date :", report_date)

        # -------------------------------------------------------
        # GEMINI AI ANALYSIS
        # -------------------------------------------------------

        ai_summary = analyze_report(

            extracted_text,

            language

        )

        if not ai_summary:

            raise HTTPException(

                status_code=500,

                detail="AI could not analyze the report."

            )

        print("\n========== AI SUMMARY ==========\n")

        print(ai_summary[:1500])

        print("\n================================\n")

        # -------------------------------------------------------
        # TEST EXTRACTION
        # -------------------------------------------------------

        tests = extract_tests(

            ai_summary

        )

        print(f"Tests Extracted : {len(tests)}")

        # -------------------------------------------------------
        # STORE IN DATABASE
        # -------------------------------------------------------

        document = {

            "user_id": current_user["_id"],

            "report_name": file.filename,

            "file_hash": file_hash,

            "language": language,

            "summary": ai_summary,

            "tests": tests,

            "report_date": report_date,

            "extracted_text": extracted_text,

            "created_at": datetime.utcnow(),

            "updated_at": datetime.utcnow()

        }

        result = reports_collection.insert_one(

            document

        )

        print("Saved Report :", result.inserted_id)

        return {

            "report_id": str(result.inserted_id),

            "summary": ai_summary,

            "tests": tests,

            "report_date": report_date,

            "reused": False

        }

    except HTTPException:

        raise

    except Exception as e:

        print("UPLOAD ERROR :", str(e))

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )

    finally:

        if os.path.exists(file_path):

            try:

                os.remove(file_path)

            except Exception:

                pass