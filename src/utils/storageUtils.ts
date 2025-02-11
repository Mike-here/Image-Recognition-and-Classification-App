import { StorageError } from 'firebase/storage';

interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffFactor: number;
}

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export function validateStorageConfig(bucket: string | undefined) {
  if (!bucket) {
    throw new StorageValidationError('Storage bucket is not configured');
  }
  
  console.log('Validating bucket:', bucket);

  // Accept all valid Firebase storage domains
  const validBucketPatterns = [
    /^[a-z0-9-]+\.appspot\.com$/,
    /^[a-z0-9-]+\.firebasestorage\.app$/,
    /^[a-z0-9-]+\.firebasestorage\.googleapis\.com$/
  ];

  const isValid = validBucketPatterns.some(pattern => pattern.test(bucket));
  if (!isValid) {
    throw new StorageValidationError(
      `Invalid storage bucket format: "${bucket}". Expected format from Firebase Console.`
    );
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: RetryConfig = { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
): Promise<T> {
  let lastError: Error;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (error instanceof StorageValidationError) {
        throw error;
      }

      // Don't retry on certain Firebase errors
      if (error instanceof StorageError) {
        if (['storage/unauthorized', 'storage/invalid-argument'].includes(error.code)) {
          throw error;
        }
      }

      if (attempt === config.maxAttempts) {
        throw error;
      }

      console.warn(`Upload attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= config.backoffFactor;
    }
  }

  throw lastError!;
} 