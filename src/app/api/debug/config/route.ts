import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 5) + '...',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.slice(0, 5) + '...',
    },
    environment: process.env.NODE_ENV
  });
} 