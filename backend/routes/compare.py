from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from lib.mongodb import reports_collection
from dependencies.auth import get_current_user

router = APIRouter(prefix="/compare", tags=["Compare"])

# --------------------------------------------------
# Medical Improvement Rules
# --------------------------------------------------

IMPROVEMENT_RULES = {
    # Better when higher
    "Hemoglobin": "up",
    "Vitamin D (25-OH)": "up",
    "Vitamin B12": "up",
    "HDL Cholesterol": "up",
    "Platelet Count": "up",
    "Total Leukocyte Count": "up",
    "Calcium": "up",
    "Ferritin": "up",

    # Better when lower
    "Fasting Blood Sugar": "down",
    "Post Prandial Sugar": "down",
    "HbA1c": "down",
    "LDL Cholesterol": "down",
    "Triglycerides": "down",
    "Cholesterol - Total": "down",
    "Creatinine": "down",
    "Urea": "down",
    "Uric Acid": "down",
    "Urine Protein": "down",
    "Urine Sugar": "down",
    "VLDL Cholesterol": "down",
    "Insulin (Fasting)": "down",
    "Bilirubin (Total)": "down"
}


# --------------------------------------------------
# Human Friendly Insight
# --------------------------------------------------

def generate_insight(test_name, trend, expected):

    if trend == "no_change":
        return f"{test_name} remained stable compared to the previous report."

    if expected == "up":

        if trend == "up":
            return f"{test_name} has improved, which is generally a positive sign."

        return f"{test_name} has decreased and may need medical attention."

    if expected == "down":

        if trend == "down":
            return f"{test_name} has improved compared to the previous report."

        return f"{test_name} has increased and may require lifestyle or medical attention."

    return f"A noticeable change was observed in {test_name}."


# --------------------------------------------------
# Compare Two Values
# --------------------------------------------------

def compare_two_values(old, new, test_name):

    if old is None or new is None:

        return {
            "change": None,
            "percentage_change": None,
            "trend": "insufficient_data",
            "is_good": None,
            "insight": "Not enough data to compare."
        }

    diff = round(new - old, 2)

    if diff > 0:
        trend = "up"
    elif diff < 0:
        trend = "down"
    else:
        trend = "no_change"

    expected = IMPROVEMENT_RULES.get(test_name)

    is_good = None

    if expected and trend != "no_change":
        is_good = (trend == expected)

    percentage = None

    if old != 0:
        percentage = round((abs(diff) / abs(old)) * 100, 1)

    return {
        "change": abs(diff),
        "percentage_change": percentage,
        "trend": trend,
        "is_good": is_good,
        "insight": generate_insight(
            test_name,
            trend,
            expected
        )
    }


# --------------------------------------------------
# Compare With Previous Compatible Report
# --------------------------------------------------

@router.get("/{latest_report_id}")
async def compare_with_previous(
    latest_report_id: str,
    current_user: dict = Depends(get_current_user)
):

    if not ObjectId.is_valid(latest_report_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid report id"
        )

    latest_report = reports_collection.find_one({

        "_id": ObjectId(latest_report_id),

        "user_id": current_user["_id"]

    })

    if not latest_report:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    if not latest_report.get("report_date"):

        return {
            "message": "Current report does not contain a valid report date.",
            "comparisons": []
        }

    latest_test_names = {

        t["name"]

        for t in latest_report.get("tests", [])

    }

    previous_report = None

    previous_reports = reports_collection.find(

        {

            "user_id": current_user["_id"],

            "report_date": {

                "$lt": latest_report["report_date"]

            }

        }

    ).sort("report_date", -1)

    # Find latest report having at least one common test
    for report in previous_reports:

        # Skip same report analysed in another language
        if report.get("file_hash") == latest_report.get("file_hash"):
            continue

        report_test_names = {

            t["name"]

            for t in report.get("tests", [])

        }

        common = latest_test_names.intersection(report_test_names)

        if common:

            previous_report = report
            break

    if previous_report is None:

        return {

            "message": "No previous report with common medical tests found.",

            "comparisons": []

        }

    prev_tests = {

        t["name"]: t

        for t in previous_report.get("tests", [])

    }

    comparisons = []

    improved = 0
    worsened = 0
    stable = 0

    for curr in latest_report.get("tests", []):

        name = curr["name"]

        if name not in prev_tests:
            continue

        prev = prev_tests[name]

        comparison = compare_two_values(

            prev.get("value_numeric"),

            curr.get("value_numeric"),

            name

        )

        if comparison["is_good"] is True:
            improved += 1

        elif comparison["is_good"] is False:
            worsened += 1

        else:
            stable += 1

        comparisons.append({

            "test_name": name,

            "previous_value": prev.get("value_numeric"),

            "current_value": curr.get("value_numeric"),

            "unit": curr.get("value_text", "").split()[-1] if curr.get("value_text") else "",

            "status": curr.get("status"),

            **comparison

        })

    return {

        "latest_report_id": str(latest_report["_id"]),

        "previous_report_id": str(previous_report["_id"]),

        "overall_summary": {

            "improved": improved,

            "worsened": worsened,

            "stable": stable,

            "total": len(comparisons)

        },

        "comparisons": comparisons

    }

# --------------------------------------------------
# HEALTH TRENDS
# --------------------------------------------------

@router.get("/trends/{test_name}")
async def get_test_trends(
    test_name: str,
    current_user: dict = Depends(get_current_user)
):

    reports = reports_collection.find(
        {
            "user_id": current_user["_id"],
            "report_date": {"$ne": None}
        }
    ).sort("report_date", 1)

    trend_data = []

    normal_min = None
    normal_max = None
    unit = ""

    for report in reports:

        for test in report.get("tests", []):

            if test["name"].lower() != test_name.lower():
                continue

            if test.get("value_numeric") is None:
                continue

            if normal_min is None:
                normal_min = test.get("normal_min")

            if normal_max is None:
                normal_max = test.get("normal_max")

            if not unit:
                value_text = test.get("value_text", "")
                if value_text:
                    parts = value_text.split()
                    if len(parts) > 1:
                        unit = parts[-1]

            trend_data.append({

                "report_id": str(report["_id"]),

                "report_date": report["report_date"],

                "value": test["value_numeric"],

                "status": test.get("status")

            })

    if not trend_data:

        return {

            "test_name": test_name,

            "message": "No trend data available.",

            "data": []

        }

    values = [x["value"] for x in trend_data]

    average = round(sum(values) / len(values), 2)

    minimum = min(values)

    maximum = max(values)

    latest = values[-1]

    earliest = values[0]

    change = round(latest - earliest, 2)

    percentage_change = None

    if earliest != 0:
        percentage_change = round(
            abs(change) / abs(earliest) * 100,
            1
        )

    expected = IMPROVEMENT_RULES.get(test_name)

    if change > 0:
        trend = "up"
    elif change < 0:
        trend = "down"
    else:
        trend = "no_change"

    is_good = None

    if expected and trend != "no_change":
        is_good = (trend == expected)

    insight = generate_insight(
        test_name,
        trend,
        expected
    )

    return {

        "test_name": test_name,

        "unit": unit,

        "normal_min": normal_min,

        "normal_max": normal_max,

        "statistics": {

            "average": average,

            "minimum": minimum,

            "maximum": maximum,

            "first_value": earliest,

            "latest_value": latest,

            "change": change,

            "percentage_change": percentage_change

        },

        "trend": trend,

        "is_good": is_good,

        "insight": insight,

        "data": trend_data

    }