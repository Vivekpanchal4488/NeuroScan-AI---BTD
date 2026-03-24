export interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

export interface DetectionResult {
  hasTumor: boolean;
  confidence: number;
  tumorArea: number;
  processedImage: string;
  tumorType?: string;
  allProbabilities?: {
    glioma: number;
    meningioma: number;
    notumor: number;
    pituitary: number;
  };
  tumorRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export type Theme = 'light' | 'dark';