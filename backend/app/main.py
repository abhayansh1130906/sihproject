from fastapi import FastAPI

from app.api.v1.competencies import router as competencies_router
from app.api.v1.courses import router as courses_router
from app.api.v1.officials import router as officials_router
from app.api.v1.training_programmes import (
    router as training_programmes_router
)
from app.api.v1.assessments import router as assessments_router
from app.api.v1.assistant import router as assistant_router

app = FastAPI(
    title="SkillIntel API",
    version="1.0.0"
)


app.include_router(officials_router)
app.include_router(competencies_router)
app.include_router(courses_router)
app.include_router(training_programmes_router)
app.include_router(assessments_router)
app.include_router(assistant_router)

@app.get("/")
def root():
    return {"message": "SkillIntel API is running"}