import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { ref, listAll } from 'firebase/storage';

export async function GET() {
  try {
    // Test storage access
    const testRef = ref(storage, 'uploads');
    const result = await listAll(testRef);

    return NextResponse.json({
      status: 'success',
      config: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 5) + '...',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.slice(0, 5) + '...',
      },
      storage: {
        bucket: storage.app.options.storageBucket,
        files: result.items.length
      }
    });
  } catch (error) {
    console.error('Firebase Debug Error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      fullError: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    }, { status: 500 });
  }
} 