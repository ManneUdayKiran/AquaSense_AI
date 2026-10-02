from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.api import observations, assessment, review, rag, analytics
from app.services.seed_data import populate_seed_data

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Robust permissions for Vercel production, preview deployments, and local dev
origins = list(settings.cors_origin_list)
known_origins = [
    "https://aquasense-ai-rose.vercel.app",
    "https://aquasense-ai.vercel.app",
    "https://ecosynai.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000"
]
for ko in known_origins:
    if ko not in origins:
        origins.append(ko)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Static file serving for photo uploads
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(observations.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Initialize seed observations
    try:
        populate_seed_data()
    except Exception as e:
        print(f"Error seeding data: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "core_principle": "AI recommends. Evidence supports. Validation checks. Humans decide."
    }
