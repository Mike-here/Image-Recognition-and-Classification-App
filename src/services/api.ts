import axios from 'axios';

export interface AnalysisResponse {
  imageId: string;
  description: string;
  labels: string[];
  confidence: number;
  error?: string;
}

export interface QueryResponse {
  answer: string;
  confidence: number;
  relatedLabels: string[];
  error?: string;
}

const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function analyzeImage(image: File, query?: string): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('image', image);
  if (query) formData.append('query', query);

  try {
    const response = await api.post<AnalysisResponse>('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new APIError(
        error.response?.data?.error || 'Failed to analyze image',
        error.response?.status,
        error.code
      );
    }
    throw error;
  }
}

export async function queryImage(imageId: string, query: string): Promise<QueryResponse> {
  try {
    const response = await api.post<QueryResponse>('/query', {
      imageId,
      query,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new APIError(
        error.response?.data?.error || 'Failed to process query',
        error.response?.status,
        error.code
      );
    }
    throw error;
  }
} 