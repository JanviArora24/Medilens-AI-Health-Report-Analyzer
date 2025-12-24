from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.gemini_ai import chat_with_gemini
from dependencies.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    report_id: str
    question: str

@router.post("/chat")
async def chat_with_ai(
    req: ChatRequest,
    user_id: str = Depends(get_current_user)   # 🔐 JWT
):
    if not req.report_id or not req.question:
        raise HTTPException(status_code=400, detail="Missing fields")

    try:
        reply = chat_with_gemini(req.report_id, req.question)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
