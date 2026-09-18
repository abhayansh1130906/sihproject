from fastapi import FastAPI
from app.api.v1.officials import router as officials_router

app = FastAPI(
    title="SkilIntel API",
    version="1.0.1"
)

app.include_router(officials_router)

@app.get("/")
def root():
    return {"message" : "SkillIntel API is running"}