import re
from datetime import datetime


# ------------------------------
# 🔢 Extract single numeric value
# ------------------------------
def _extract_number(text):
    if not text:
        return None

    m = re.search(r"(\d+(\.\d+)?)", text)
    return float(m.group(1)) if m else None


# ---------------------------------
# 🔢 Extract normal range (ROBUST)
# ---------------------------------
def _extract_range(text):
    if not text:
        return (None, None)

    text = text.lower()

    m = re.search(r"(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)", text)
    if m:
        return float(m.group(1)), float(m.group(2))

    m = re.search(r"(\d+\.?\d*)\s*se\s*(\d+\.?\d*)", text)
    if m:
        return float(m.group(1)), float(m.group(2))

    m = re.search(r"(less than|below|under|upto|up to)\s*(\d+\.?\d*)", text)
    if m:
        return None, float(m.group(2))

    m = re.search(r"(greater than|above|more than)\s*(\d+\.?\d*)", text)
    if m:
        return float(m.group(2)), None

    m = re.search(r"<\s*(\d+\.?\d*)", text)
    if m:
        return None, float(m.group(1))

    m = re.search(r">\s*(\d+\.?\d*)", text)
    if m:
        return float(m.group(1)), None

    return (None, None)


# ---------------------------------
# 📅 Extract REPORT DATE
# ---------------------------------
# ---------------------------------
# 📅 Extract REPORT DATE (ROBUST)
# ---------------------------------
def extract_report_date(text):

    if not text:
        return None

    text = text.replace("\n", " ")

    # First try keywords
    keyword_patterns = [
        r"Reported.*?(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
        r"Collected.*?(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
        r"Report\s*Date.*?(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
    ]

    for pattern in keyword_patterns:

        m = re.search(pattern, text, re.IGNORECASE)

        if m:
            date_str = m.group(1)

            for fmt in ("%d/%m/%Y", "%d-%m-%Y"):

                try:
                    return datetime.strptime(date_str, fmt)
                except:
                    pass

    # -------------------------
    # FALLBACK
    # -------------------------

    all_dates = re.findall(
        r"\d{1,2}[/-]\d{1,2}[/-]\d{4}",
        text
    )

    for d in all_dates:

        for fmt in ("%d/%m/%Y", "%d-%m-%Y"):

            try:
                return datetime.strptime(d, fmt)
            except:
                pass

    return None


# ---------------------------------
# 🧠 Extract tests from AI summary
# ---------------------------------
def extract_tests(summary_text: str):
    tests = []
    if not summary_text:
        return tests

    blocks = re.split(r"•\s*Test Name\s*:", summary_text)

    for block in blocks[1:]:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        name = lines[0]

        value_text = ""
        range_text = ""
        status = "Normal"
        cause = ""
        tips = []

        for l in lines:
            low = l.lower()
            if "your value" in low:
                value_text = l
            elif "normal range" in low:
                range_text = l
            elif "status" in low:
                status = l.split(":", 1)[-1].strip().title()
            elif "possible cause" in low or "iska karan" in low:
                cause = l.split(":", 1)[-1].strip()
            elif "tips" in low:
                tips.append(l.split(":", 1)[-1].strip())

        value_numeric = _extract_number(value_text)
        normal_min, normal_max = _extract_range(range_text)

        tests.append({
            "name": name,
            "value_text": value_text,
            "normal_range_text": range_text,
            "value_numeric": value_numeric,
            "normal_min": normal_min,
            "normal_max": normal_max,
            "status": status,
            "cause": cause,
            "tips": tips
        })

    return tests
