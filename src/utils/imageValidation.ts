export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export async function validateImage(
  file: File,
  options: ImageValidationOptions = {}
): Promise<void> {
  const {
    maxSizeInMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  } = options;

  // Check if file exists
  if (!file) {
    throw new ImageValidationError('No image file provided');
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new ImageValidationError(
      `Image size exceeds ${maxSizeInMB}MB limit. Please upload a smaller image.`
    );
  }

  // Check file type
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new ImageValidationError(
      `Invalid file type. Allowed types: ${allowedTypes
        .map(type => type.replace('image/', ''))
        .join(', ')}`
    );
  }
}

// Client-side dimension validation (if needed)
export function validateImageDimensions(
  file: File,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(true);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width > maxWidth || img.height > maxHeight) {
        reject(new ImageValidationError(
          `Image dimensions exceed ${maxWidth}x${maxHeight} limit.`
        ));
      }
      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageValidationError('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

export function isBase64Image(str: string): boolean {
  try {
    const regex = /^data:image\/(png|jpg|jpeg|webp|heic);base64,/;
    if (!regex.test(str)) return false;
    
    const base64 = str.split(',')[1];
    return base64.length % 4 === 0 && /^[A-Za-z0-9+/]+[=]{0,2}$/.test(base64);
  } catch {
    return false;
  }
} 