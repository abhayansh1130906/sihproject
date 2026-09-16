from fastapi import FastAPI

app = FastAPI(
    title="SkilIntel API",
    version="1.0.1"
)

@app.get("/")
def root():
    return {"message" : "SkillIntel API is running"}