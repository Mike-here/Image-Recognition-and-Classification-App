from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from pydantic import BaseModel

# Create response models
class ImageResult(BaseModel):
    filename: str
    size: int
    content_type: str

class ProcessingResponse(BaseModel):
    status: str
    results: List[ImageResult]

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process-images", response_model=ProcessingResponse)
async def process_images(files: List[UploadFile] = File(...)):
    try:
        results = []
        for file in files:
            # Process each image
            content = await file.read()
            # Add image processing logic here
            results.append(ImageResult(
                filename=file.filename,
                size=len(content),
                content_type=file.content_type
            ))
        return ProcessingResponse(status="success", results=results)
    except Exception as e:
        return ProcessingResponse(status="error", results=[])

@app.get("/")
async def root():
    return {"message": "Image Recognition API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 