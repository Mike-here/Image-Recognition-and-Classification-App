import { GoogleGenerativeAI } from '@google/generative-ai';

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