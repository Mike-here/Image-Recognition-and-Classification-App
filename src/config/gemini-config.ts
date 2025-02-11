import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Get the image generation model
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export { model };

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-pro-vision',
  maxBatchSize: 10, // Maximum number of images in batch processing
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 4 * 1024 * 1024, // 4MB limit
};

export const initializeGemini = () => {
  const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
  return genAI.getGenerativeModel({ model: geminiConfig.modelName });
}; 