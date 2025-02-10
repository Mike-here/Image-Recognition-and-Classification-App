from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import uvicorn
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import io
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini API
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # List available models for debugging
    logger.info("Available models:")
    for model in genai.list_models():
        logger.info(f"- {model.name}")
    
    # Use the newer model
    model = genai.GenerativeModel('gemini-1.5-flash')  # Updated to latest model
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {e}")
    raise

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageResult(BaseModel):
    filename: str
    size: int
    content_type: str
    labels: List[str]
    description: str
    error: str | None = None

class ProcessingResponse(BaseModel):
    status: str
    results: List[ImageResult]
    error: str | None = None

async def analyze_image(image_content: bytes, filename: str) -> dict:
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_content))
        
        # Optimized prompt for flash model
        prompt = """
        Analyze this image and return a JSON response with:
        1. Up to 5 key objects/elements in the "labels" array
        2. A single sentence description
        Example format:
        {"labels": ["item1", "item2"], "description": "Brief scene description."}
        """

        # Get response from Gemini
        response = model.generate_content([prompt, img], generation_config={
            "temperature": 0.4,  # More focused responses
            "max_output_tokens": 200  # Limit response length
        })
        
        try:
            # Extract JSON from response
            result_text = response.text.strip().strip('`').strip()
            if result_text.startswith('json'):
                result_text = result_text[4:]
            result = json.loads(result_text)
            
            return {
                "labels": result.get("labels", [])[:5],
                "description": result.get("description", "No description available")
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            # Simplified fallback parsing
            text = response.text
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            description = sentences[0] + '.' if sentences else "No description available"
            
            # Extract potential labels from the text
            words = set(word.strip(',.!?()[]{}') for word in text.split())
            labels = list(words)[:5]  # Use first 5 significant words as labels
            
            return {
                "labels": labels if labels else ["Unstructured Response"],
                "description": description
            }
            
    except Exception as e:
        logger.error(f"Error analyzing image {filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing image: {str(e)}"
        )

@app.post("/api/process-images", response_model=ProcessingResponse)
async def process_images(files: List[UploadFile] = File(...)):
    try:
        if not files:
            raise HTTPException(
                status_code=400,
                detail="No files provided"
            )
            
        results = []
        for file in files:
            try:
                # Validate file type
                if not file.content_type.startswith('image/'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {file.filename} is not an image"
                    )
                
                # Read image content
                content = await file.read()
                
                # Analyze image using Gemini
                analysis = await analyze_image(content, file.filename)
                
                # Create result object
                result = ImageResult(
                    filename=file.filename,
                    size=len(content),
                    content_type=file.content_type,
                    labels=analysis["labels"],
                    description=analysis["description"]
                )
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {e}")
                results.append(ImageResult(
                    filename=file.filename,
                    size=0,
                    content_type=file.content_type,
                    labels=[],
                    description="",
                    error=str(e)
                ))
            
        return ProcessingResponse(
            status="success",
            results=results
        )
        
    except Exception as e:
        logger.error(f"Error in process_images: {e}")
        return ProcessingResponse(
            status="error",
            results=[],
            error=str(e)
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "not configured"
    }

@app.get("/")
async def root():
    return {"message": "Image Recognition API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 