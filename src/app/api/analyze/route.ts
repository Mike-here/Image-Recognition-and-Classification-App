import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { ref, uploadBytes, getDownloadURL, StorageError } from 'firebase/storage';
import OpenAI from 'openai';
import { validateImage, ImageValidationError } from '@/utils/imageValidation';
import { validateStorageConfig, retryOperation, StorageValidationError } from '@/utils/storageUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function uploadToFirebase(file: File, buffer: Buffer) {
  try {
    validateStorageConfig(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

    // Create a safe filename
    const timestamp = Date.now();
    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_'); // Replace any non-alphanumeric chars
    const extension = safeFileName.split('.').pop();
    const uniqueFilename = `uploads/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

    // Create storage reference with safe path
    const imageRef = ref(storage, uniqueFilename);

    // Add detailed metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        timestamp: timestamp.toString(),
        size: buffer.length.toString()
      }
    };

    // Attempt upload with retries
    const uploadResult = await retryOperation(async () => {
      const result = await uploadBytes(imageRef, buffer, metadata);
      console.log('Upload successful:', {
        path: result.ref.fullPath,
        metadata: result.metadata
      });
      return result;
    });

    const downloadURL = await getDownloadURL(uploadResult.ref);
    return { url: downloadURL, ref: uploadResult.ref, path: uniqueFilename };

  } catch (error) {
    console.error('Detailed Storage Error:', {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error instanceof StorageError ? error.code : 'unknown',
      errorStack: error.stack,
      serverResponse: error instanceof StorageError ? error.serverResponse : null,
      storageConfig: {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      },
      requestDetails: {
        fileName: file.name,
        fileType: file.type,
        fileSize: buffer.length
      }
    });
    throw error;
  }
}

class AnalysisError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const query = formData.get('query') as string;

    if (!imageFile || !(imageFile instanceof File)) {
      throw new AnalysisError('No image file provided', 400);
    }

    console.log('Received file:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });

    // Validate image
    try {
      await validateImage(imageFile, {
        maxSizeInMB: 10,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
    } catch (error) {
      if (error instanceof ImageValidationError) {
        throw new AnalysisError(error.message, 400);
      }
      throw error;
    }

    // Convert to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase
    let uploadResult;
    try {
      uploadResult = await uploadToFirebase(imageFile, buffer);
    } catch (error) {
      if (error instanceof StorageError) {
        throw new AnalysisError('Storage Error', 500);
      }
      throw error;
    }

    // Process with OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: query || "Describe this image in detail and identify key objects." },
              { type: "image_url", image_url: { url: uploadResult.url } }
            ],
          },
        ],
        max_tokens: 300,
      });

      return NextResponse.json({
        imageId: uploadResult.path,
        description: response.choices[0].message.content,
        labels: extractLabels(response.choices[0].message.content),
        confidence: 0.95,
      });
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new AnalysisError('Failed to analyze image', 500);
    }
  } catch (error) {
    console.error('Analysis Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error instanceof AnalysisError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function extractLabels(text: string): string[] {
  const words = text.split(' ');
  return words
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase())
    .slice(0, 5);
} 