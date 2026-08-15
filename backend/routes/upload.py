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
import time


router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------------------------------------------
# CONSTANTS
# -------------------------------------------------------

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg"
}


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
# FILE SIZE VALIDATION + SAVE
# -------------------------------------------------------

def save_file_with_limit(upload_file, file_path):

    total_size = 0

    with open(file_path, "wb") as buffer:

        while True:

            chunk = upload_file.file.read(1024 * 1024)  # 1 MB

            if not chunk:
                break

            total_size += len(chunk)

            # Reject files larger than 10 MB
            if total_size > MAX_FILE_SIZE:

                raise HTTPException(
                    status_code=413,
                    detail="File size must not exceed 10 MB."
                )

            buffer.write(chunk)

    # Empty file validation
    if total_size == 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    return total_size


# -------------------------------------------------------
# FILE SIGNATURE VALIDATION
# -------------------------------------------------------

def validate_file_signature(file_path: str, extension: str):

    with open(file_path, "rb") as f:

        header = f.read(16)

    # PDF
    if extension == ".pdf":

        if not header.startswith(b"%PDF"):

            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted PDF file."
            )

    # PNG
    elif extension == ".png":

        if header[:8] != b"\x89PNG\r\n\x1a\n":

            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted PNG file."
            )

    # JPEG
    elif extension in [".jpg", ".jpeg"]:

        if not header.startswith(b"\xff\xd8\xff"):

            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted JPEG file."
            )


# -------------------------------------------------------
# UPLOAD REPORT
# -------------------------------------------------------

@router.post("/upload")
async def upload_report(

    file: UploadFile = File(...),

    language: str = Form(...),

    current_user: dict = Depends(get_current_user)

):

    start_time = time.perf_counter()

    # -------------------------------------------------------
    # FILE NAME VALIDATION
    # -------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    # -------------------------------------------------------
    # EXTENSION VALIDATION
    # -------------------------------------------------------

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:

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
        # SAVE FILE WITH 10 MB LIMIT
        # -------------------------------------------------------

        file_size = save_file_with_limit(

            file,

            file_path

        )

        print(
            f"Uploaded file size: "
            f"{file_size / (1024 * 1024):.2f} MB"
        )

        # -------------------------------------------------------
        # FILE SIGNATURE / CORRUPTION VALIDATION
        # -------------------------------------------------------

        validate_file_signature(

            file_path,

            extension

        )

        # -------------------------------------------------------
        # HASH
        # -------------------------------------------------------

        file_hash = calculate_file_hash(

            file_path

        )

        # -------------------------------------------------------
        # DUPLICATE CHECK
        # -------------------------------------------------------

        existing = reports_collection.find_one({

            "user_id": current_user["_id"],

            "file_hash": file_hash,

            "language": language

        })

        if existing:

            processing_time = (
                time.perf_counter() - start_time
            )

            print(
                f"Duplicate report reused in "
                f"{processing_time:.2f} seconds"
            )

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

        extracted_text = extract_text(

            file_path

        )

        print(
            "\n========== OCR TEXT ==========\n"
        )

        print(
            extracted_text[:3000]
        )

        print(
            "\n==============================\n"
        )

        print(
            "Text Length :",
            len(extracted_text)
        )

        # -------------------------------------------------------
        # TEXT VALIDATION
        # -------------------------------------------------------

        if not extracted_text or not extracted_text.strip():

            raise HTTPException(

                status_code=400,

                detail=(
                    "Unable to extract text from the uploaded "
                    "report. The file may be empty, corrupted, "
                    "or contain no readable text."
                )

            )

        # -------------------------------------------------------
        # REPORT DATE
        # -------------------------------------------------------

        report_date = extract_report_date(

            extracted_text

        )

        print(
            "Report Date :",
            report_date
        )

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

        print(
            "\n========== AI SUMMARY ==========\n"
        )

        print(
            ai_summary[:1500]
        )

        print(
            "\n================================\n"
        )

        # -------------------------------------------------------
        # TEST EXTRACTION
        # -------------------------------------------------------

        tests = extract_tests(

            ai_summary

        )

        print(
            f"Tests Extracted : {len(tests)}"
        )

        # -------------------------------------------------------
        # STORE IN DATABASE
        # -------------------------------------------------------

        document = {

            "user_id": current_user["_id"],

            "report_name": file.filename,

            "file_hash": file_hash,

            "file_size": file_size,

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

        # -------------------------------------------------------
        # PROCESSING TIME
        # -------------------------------------------------------

        processing_time = (
            time.perf_counter() - start_time
        )

        print(
            f"\nProcessing Time: "
            f"{processing_time:.2f} seconds"
        )

        print(
            "Saved Report :",
            result.inserted_id
        )

        # -------------------------------------------------------
        # RESPONSE
        # -------------------------------------------------------

        return {

            "report_id": str(result.inserted_id),

            "summary": ai_summary,

            "tests": tests,

            "report_date": report_date,

            "reused": False,

            "processing_time_seconds": round(
                processing_time,
                2
            )

        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "UPLOAD ERROR :",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail="Failed to process the uploaded report."

        )

    finally:

        if os.path.exists(file_path):

            try:

                os.remove(file_path)

            except Exception:

                pass