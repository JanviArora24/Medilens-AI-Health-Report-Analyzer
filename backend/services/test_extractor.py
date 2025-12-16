import re

def extract_tests(summary_text: str):
    tests = []

    if not summary_text:
        return tests

    # Split per test block
    blocks = re.split(r"•\s*Test Name\s*:", summary_text)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # ---- NAME ----
        name_match = re.match(r"([A-Za-z ()⁺³\/\-]+)", block)
        if not name_match:
            continue
        name = name_match.group(1).strip()

        # ---- NORMAL RANGE ----
        normal_match = re.search(r"Normal Range:\s*([^\n]+)", block)
        normal_range = normal_match.group(1).strip() if normal_match else ""

        # ---- VALUE ----
        value_match = re.search(r"Your Value:\s*([^\n]+)", block)
        value = value_match.group(1).strip() if value_match else ""

        # ---- STATUS ----
        status_match = re.search(r"Status:\s*([A-Za-z ]+)", block)
        status = status_match.group(1).strip().title() if status_match else "Normal"

        # ---- CAUSE (ONLY IF ABNORMAL) ----
        cause = ""
        if status.lower() in ["low", "high", "borderline", "borderline high"]:
            cause_match = re.search(
                r"(Possible Cause|Iska Karan|Cause):\s*([^\n]+)",
                block,
                re.IGNORECASE
            )
            if cause_match:
                cause = cause_match.group(2).strip()

        # ---- TIPS (ONLY IF ABNORMAL) ----
        tips = []
        if status.lower() in ["low", "high", "borderline", "borderline high"]:
            tips_section = re.search(
                r"Lifestyle tips.*?:([\s\S]+)",
                block,
                re.IGNORECASE
            )
            if tips_section:
                tips = [
                    t.strip("• ").strip()
                    for t in tips_section.group(1).split("\n")
                    if t.strip()
                ]

        tests.append({
            "name": name,
            "value": value,
            "normal_range": normal_range,
            "status": status,
            "cause": cause,
            "tips": tips
        })

    return tests
