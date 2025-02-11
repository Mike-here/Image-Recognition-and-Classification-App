import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { ref, getDownloadURL } from 'firebase/storage';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageId, query } = await request.json();

    // 1. Get image URL from Firebase
    const imageRef = ref(storage, imageId);
    const imageUrl = await getDownloadURL(imageRef);

    // 2. Process query with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: query },
            { type: "image_url", url: imageUrl }
          ],
        },
      ],
      max_tokens: 150,
    });

    // 3. Format and return response
    const answer = response.choices[0].message.content;

    return NextResponse.json({
      answer,
      confidence: 0.9,
      relatedLabels: extractKeywords(answer),
    });
  } catch (error) {
    console.error('Query Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process query',
        code: error.code,
      },
      { status: error.status || 500 }
    );
  }
}

function extractKeywords(text: string): string[] {
  const words = text.split(' ');
  const keywords = words
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase())
    .filter(word => !['this', 'that', 'with', 'from'].includes(word));
  
  return [...new Set(keywords)].slice(0, 3);
} 