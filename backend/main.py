from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.analyze import router as analyze_router
from routes.reports import router as reports_router

app = FastAPI(title="MediLens Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/uploadfile")
app.include_router(analyze_router, prefix="/analyze")
app.include_router(reports_router, prefix="/reports")

@app.get("/")
def root():
    return {"message": "MediLens backend running"}
