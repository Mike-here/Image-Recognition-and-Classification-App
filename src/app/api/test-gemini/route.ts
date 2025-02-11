import { NextResponse } from 'next/server';
import { model } from '@/config/gemini-config';
import { ImageProcessingService } from '@/services/ImageProcessingService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageService = new ImageProcessingService(model);
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      content: await file.arrayBuffer()
    };

    const result = await imageService.processImage(fileData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Gemini processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
} 