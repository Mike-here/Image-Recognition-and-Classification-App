export interface FileData {
  name: string;
  type: string;
  size: number;
  content: ArrayBuffer;
}

export interface ProcessingResult {
  success: boolean;
  description?: string;
  error?: string;
}

export interface EnhancementOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  quality?: number;
  format?: string;
}

export interface TrackingResult {
  frames: Array<{
    timestamp?: number;
    objects?: Array<{
      id: string;
      label: string;
      confidence: number;
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  }>;
} 