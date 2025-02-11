import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { ref, listAll } from 'firebase/storage';

export async function GET() {
  try {
    const uploadsRef = ref(storage, 'uploads');
    const result = await listAll(uploadsRef);
    
    return NextResponse.json({
      status: 'Firebase Storage Connected',
      bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      files: result.items.length,
      prefixes: result.prefixes.length
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Firebase Storage Error',
      details: error.message,
      config: {
        bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    }, { status: 500 });
  }
} 