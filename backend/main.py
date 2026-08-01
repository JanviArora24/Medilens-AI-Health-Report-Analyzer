from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router as upload_router
from routes.analyze import router as analyze_router
from routes.reports import router as reports_router
from routes.auth import router as auth_router
from routes.compare import router as compare_router   # ✅ NEW

app = FastAPI(title="MediLens Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(upload_router, prefix="/uploadfile")
app.include_router(analyze_router, prefix="/analyze")
app.include_router(reports_router, prefix="/reports")
app.include_router(compare_router)  # ✅ NEW

@app.get("/")
def root():
    return {"message": "MediLens backend running"}
