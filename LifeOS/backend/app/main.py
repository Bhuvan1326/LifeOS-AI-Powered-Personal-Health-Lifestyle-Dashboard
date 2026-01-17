from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routes import auth, habits, mood, nutrition, finance, insights

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LifeOS API",
    description="AI-Powered Decision Intelligence for Personal Health & Lifestyle",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(mood.router)
app.include_router(nutrition.router)
app.include_router(finance.router)
app.include_router(insights.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to LifeOS API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
