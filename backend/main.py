import os

# Try to load .env file manually to avoid dependency issues
try:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    key, _, value = line.partition("=")
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value
except Exception as e:
    print(f"Warning: Failed to load .env file: {e}")

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.screener import extract_text_from_file, local_screener, gemini_screener

app = FastAPI(title="Resume Screener AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get absolute path to backend directory to prevent relative path issues
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Ensure static directory exists
os.makedirs(STATIC_DIR, exist_ok=True)

# Endpoint to check health
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/config")
def get_config():
    return {"has_api_key": bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/api/screen")
async def screen_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    api_key: str = Form(None)
):
    # Validate file type
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx", ".txt", ".md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a PDF, DOCX, or TXT file."
        )
        
    try:
        # Read file contents
        contents = await file.read()
        
        # Extract text
        resume_text = extract_text_from_file(contents, filename)
        
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Failed to extract text from the resume file. The file might be empty or corrupted."
            )
            
        # Select analysis mode based on API Key availability
        effective_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if effective_key and effective_key.strip():
            # Deep AI analysis
            result = gemini_screener(resume_text, job_description, effective_key.strip())
        else:
            # Local NLP fallback analysis
            result = local_screener(resume_text, job_description)
            
        return result
        
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while screening the resume: {str(e)}")

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Catch-all endpoint to serve the frontend
@app.get("/")
def serve_frontend():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Backend running. Frontend index.html not found in static folder."}
