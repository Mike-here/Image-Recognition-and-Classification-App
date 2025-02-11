import { NextResponse } from 'next/server';
import { storage } from '@/config/firebase-config';
import { adminStorage } from '@/config/firebase-admin';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export async function GET() {
  try {
    // Test client SDK
    const clientRef = ref(storage, 'test/client-debug.txt');
    await uploadString(clientRef, 'Client SDK test content');
    const clientUrl = await getDownloadURL(clientRef);

    // Test admin SDK
    const adminBucket = adminStorage.bucket();
    const adminFile = adminBucket.file('test/admin-debug.txt');
    await adminFile.save('Admin SDK test content');
    const [adminUrl] = await adminFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    return NextResponse.json({
      status: 'success',
      message: 'Storage access test passed',
      urls: {
        client: clientUrl,
        admin: adminUrl
      },
      config: {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId,
        rules: 'unrestricted'
      }
    });
  } catch (error) {
    console.error('Storage Test Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      serverResponse: error.serverResponse
    });

    return NextResponse.json({
      status: 'error',
      error: error.message,
      details: {
        code: error.code,
        serverResponse: error.serverResponse
      }
    }, { status: 500 });
  }
} 