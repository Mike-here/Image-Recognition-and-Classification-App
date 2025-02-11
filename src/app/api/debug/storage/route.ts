import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { ref, listAll } from 'firebase/storage';

export async function GET() {
  try {
    const testRef = ref(storage, 'uploads');
    const result = await listAll(testRef);

    return NextResponse.json({
      status: 'success',
      storage: {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId,
        files: result.items.length
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      config: {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      }
    }, { status: 500 });
  }
} 