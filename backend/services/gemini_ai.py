import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
from bson import ObjectId
from lib.mongodb import reports_collection

load_dotenv()

# ---------------- GEMINI SETUP ----------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"

# ---------------- CLEANERS ----------------
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"`", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

# ---------------- REPORT ANALYSIS ----------------
def analyze_report(text: str, language: str = "english") -> str:
    if not text or not text.strip():
        return "No text found in report."

    language = language.lower().strip()

    # ✅ Explanation language ONLY (labels NEVER change)
    explain_language = {
        "english": "Explain in SIMPLE ENGLISH.",
        "hindi": "Explain in SIMPLE HINDI.",
        "hinglish": "Explain in SIMPLE HINGLISH."
    }.get(language, "Explain in SIMPLE ENGLISH.")

    # 🔥 CRITICAL FIX — labels MUST stay English
    prompt = f"""
VERY IMPORTANT (DO NOT BREAK THIS):
- Field labels MUST be in ENGLISH exactly as written.
- DO NOT translate labels.
- ONLY explanation text language can change.

Explanation rule:
{explain_language}

STRICT FORMAT (LABELS FIXED):

• Test Name:
• What is this test:
• Normal Range:
• Your Value:
• Status:

ONLY IF Status is High / Low / Borderline:
• Possible Cause:
• Lifestyle tips to correct:

ONLY IF Status is Normal:
- STOP after Status

Medical Report Text:
{text}
"""

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)

    return clean_text(response.text)

# ---------------- CHAT WITH GEMINI ----------------
def chat_with_gemini(report_id: str, question: str) -> str:
    report = reports_collection.find_one({"_id": ObjectId(report_id)})
    if not report:
        return "Report not found."

    summary = report.get("summary", "")
    language = report.get("language", "english").lower().strip()

    reply_language = {
        "english": "Reply in SIMPLE ENGLISH.",
        "hindi": "Reply in SIMPLE HINDI.",
        "hinglish": "Reply in SIMPLE HINGLISH."
    }.get(language, "Reply in SIMPLE ENGLISH.")

    prompt = f"""
Reply language rule:
{reply_language}

You are a medical assistant.

RULES:
- Use bullet points
- Keep answer short
- Be reassuring
- No medical jargon

Report Summary:
{summary}

User Question:
{question}
"""

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)

    return clean_text(response.text)
