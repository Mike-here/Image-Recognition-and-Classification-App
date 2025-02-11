import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { FileData, ProcessingResult, EnhancementOptions, TrackingResult } from '../types';

class ImageProcessingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class ImageProcessingService {
  private model: GenerativeModel;

  constructor(model: GenerativeModel) {
    this.model = model;
  }

  async processBatchImages(files: FileData[]): Promise<ProcessingResult[]> {
    try {
      const results = await Promise.all(
        files.map(file => this.processImage(file))
      );
      return results;
    } catch (error) {
      throw new Error(`Batch processing failed: ${error.message}`);
    }
  }

  async processImage(file: FileData): Promise<ProcessingResult> {
    try {
      if (!file.content) {
        throw new ImageProcessingError('No image content provided');
      }

      const base64Data = Buffer.from(file.content).toString('base64');
      
      const imageData = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      const result = await this.model.generateContent([
        "Please analyze this image and describe its contents in detail.",
        imageData
      ]);
      const response = await result.response;
      return {
        success: true,
        description: response.text()
      };
    } catch (error) {
      console.error('Image Processing Error:', {
        name: error.name,
        message: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error instanceof ImageProcessingError 
          ? error.message 
          : 'Failed to process image'
      };
    }
  }

  async enhanceImage(file: FileData, options: EnhancementOptions): Promise<FileData> {
    try {
      // Convert ArrayBuffer to base64
      const base64Data = Buffer.from(file.content).toString('base64');
      
      const imageData = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      const prompt = `Enhance this image with the following options: ${JSON.stringify(options)}`;
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      
      // Convert response back to ArrayBuffer
      const buffer = Buffer.from(response.text(), 'base64');
      
      return {
        ...file,
        name: file.name.replace(/(\.\w+)$/, '_enhanced$1'),
        content: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      };
    } catch (error) {
      throw new Error(error.message || "Image enhancement failed");
    }
  }

  async extractText(file: FileData): Promise<string> {
    try {
      const base64Data = Buffer.from(file.content).toString('base64');
      
      const imageData = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      const result = await this.model.generateContent([
        "Extract and return only the text from this image.",
        imageData
      ]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(error.message || "Text extraction failed");
    }
  }

  async trackObjects(videoFile: FileData): Promise<TrackingResult> {
    try {
      const base64Data = Buffer.from(videoFile.content).toString('base64');
      
      const videoData = {
        inlineData: {
          data: base64Data,
          mimeType: videoFile.type
        }
      };

      const result = await this.model.generateContent([
        "Track and identify objects in this video. Return the frame-by-frame tracking data.",
        videoData
      ]);
      const response = await result.response;
      
      return {
        frames: JSON.parse(response.text())
      };
    } catch (error) {
      throw new Error(error.message || "Object tracking failed");
    }
  }
} 