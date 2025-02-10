from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro-vision')

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

class ProcessingResponse(BaseModel):
    status: str
    results: List[ImageResult]

async def analyze_image(image_content: bytes, filename: str) -> dict:
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_content))
        
        # Generate prompt for image analysis
        prompt = """
        Analyze this image and provide:
        1. A list of objects/items detected
        2. A brief description of the scene
        3. Any notable characteristics
        Format the response as JSON with keys: 'labels' (list) and 'description' (string)
        """

        # Get response from Gemini
        response = model.generate_content([prompt, img])
        result = response.text
        
        # Parse the response (assuming it returns JSON-formatted string)
        # In real implementation, you might need to parse the text response
        return {
            "labels": ["detected_object_1", "detected_object_2"],  # Replace with actual labels
            "description": result
        }
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {
            "labels": [],
            "description": "Error analyzing image"
        }

@app.post("/api/process-images", response_model=ProcessingResponse)
async def process_images(files: List[UploadFile] = File(...)):
    try:
        results = []
        for file in files:
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
            
        return ProcessingResponse(status="success", results=results)
    except Exception as e:
        print(f"Error processing images: {e}")
        return ProcessingResponse(status="error", results=[])

@app.get("/")
async def root():
    return {"message": "Image Recognition API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 