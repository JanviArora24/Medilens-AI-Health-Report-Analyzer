import os
import re
import fitz
import cv2
import numpy as np
import pytesseract

from PIL import Image
from pdf2image import convert_from_path
from datetime import datetime


# -------------------------------------------------------
# TESSERACT PATH
# -------------------------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# -------------------------------------------------------
# IMAGE PREPROCESSING
# -------------------------------------------------------

def preprocess_image(image):

    try:

        osd = pytesseract.image_to_osd(image)

        angle = int(
            re.search(
                r"Rotate: (\d+)",
                osd
            ).group(1)
        )

        if angle != 0:

            image = image.rotate(

                360 - angle,

                expand=True

            )

    except Exception:
        pass

    img = np.array(image)

    if len(img.shape) == 3:

        img = cv2.cvtColor(

            img,

            cv2.COLOR_RGB2GRAY

        )

    img = cv2.resize(

        img,

        None,

        fx=2,

        fy=2,

        interpolation=cv2.INTER_CUBIC

    )

    img = cv2.GaussianBlur(

        img,

        (3, 3),

        0

    )

    img = cv2.adaptiveThreshold(

        img,

        255,

        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,

        cv2.THRESH_BINARY,

        31,

        11

    )

    kernel = np.ones((1, 1), np.uint8)

    img = cv2.morphologyEx(

        img,

        cv2.MORPH_OPEN,

        kernel

    )

    img = cv2.morphologyEx(

        img,

        cv2.MORPH_CLOSE,

        kernel

    )

    return Image.fromarray(img)


# -------------------------------------------------------
# OCR IMAGE
# -------------------------------------------------------

def extract_text_from_image(image):

    image = preprocess_image(image)

    configs = [

        "--oem 3 --psm 3",

        "--oem 3 --psm 4",

        "--oem 3 --psm 6"

    ]

    best_text = ""

    for cfg in configs:

        try:

            text = pytesseract.image_to_string(

                image,

                lang="eng",

                config=cfg

            ).strip()

            if len(text) > len(best_text):

                best_text = text

        except Exception:
            pass

    return best_text


# -------------------------------------------------------
# OCR SCANNED PDF
# -------------------------------------------------------

def extract_text_from_scanned_pdf(pdf_path):

    pages = convert_from_path(

        pdf_path,

        dpi=300

    )

    complete_text = ""

    for index, page in enumerate(pages):

        print(f"OCR Page {index+1}")

        page_text = extract_text_from_image(page)

        complete_text += page_text

        complete_text += "\n"

    complete_text = complete_text.strip()

    print("OCR Text Length =", len(complete_text))

    if len(complete_text) < 20:

        return ""

    return complete_text


# -------------------------------------------------------
# MAIN EXTRACTION
# -------------------------------------------------------

def extract_text(file_path):

    extension = os.path.splitext(file_path)[1].lower()

    # ---------------- IMAGE ----------------

    if extension in [

        ".png",

        ".jpg",

        ".jpeg"

    ]:

        print("Processing Image...")

        image = Image.open(file_path)

        text = extract_text_from_image(image)

        print("Image OCR Length =", len(text))

        return text

    # ---------------- PDF ----------------

    text = ""

    try:

        with fitz.open(file_path) as pdf:

            print(f"PDF Pages = {len(pdf)}")

            for page in pdf:

                text += page.get_text()

    except Exception as e:

        print("PyMuPDF Error :", e)

        text = ""

    if text.strip():

        print("Normal PDF detected.")

        print("PDF Text Length =", len(text))

        return text.strip()

    print("Scanned PDF detected.")

    print("Running OCR...")

    try:

        ocr_text = extract_text_from_scanned_pdf(file_path)

        if not ocr_text:

            print("OCR Failed.")

        else:

            print("OCR Success.")

        return ocr_text

    except Exception as e:

        print("OCR Exception :", e)

        return ""

# ------------------------------------
# REPORT DATE EXTRACTION
# ------------------------------------


# -------------------------------------------------------
# REPORT DATE EXTRACTION (ROBUST)
# -------------------------------------------------------

def extract_report_date(text):

    if not text:
        return None

    text = text.replace("\n", " ")

    patterns = [

        # Lal PathLabs
        r"Reported\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
        r"Collected\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

        # Generic
        r"Report\s*Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
        r"Collection\s*Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
        r"Sample\s*Collected\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})",

        # yyyy-mm-dd
        r"(20\d{2}-\d{2}-\d{2})",

        # dd/mm/yyyy
        r"(\d{1,2}/\d{1,2}/20\d{2})",

        # dd-mm-yyyy
        r"(\d{1,2}-\d{1,2}-20\d{2})"

    ]

    formats = [

        "%Y-%m-%d",

        "%d/%m/%Y",

        "%d-%m-%Y"

    ]

    for pattern in patterns:

        match = re.search(

            pattern,

            text,

            re.IGNORECASE

        )

        if not match:
            continue

        value = match.group(1)

        for fmt in formats:

            try:

                date = datetime.strptime(

                    value,

                    fmt

                )

                print("Report Date Found :", date)

                return date

            except Exception:
                pass

    # ---------------------------------------------------
    # FALLBACK
    # First valid date anywhere in report
    # ---------------------------------------------------

    all_dates = re.findall(

        r"\d{1,2}[/-]\d{1,2}[/-]20\d{2}",

        text

    )

    for value in all_dates:

        for fmt in [

            "%d/%m/%Y",

            "%d-%m-%Y"

        ]:

            try:

                date = datetime.strptime(

                    value,

                    fmt

                )

                print("Fallback Date :", date)

                return date

            except:
                pass

    print("No Report Date Found")

    return None