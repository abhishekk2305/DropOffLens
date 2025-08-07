export interface FeedbackTheme {
  name: string;
  summary: string;
  percentage: number;
  quotes: string[];
  suggestedAction: string;
}

export interface AnalysisResults {
  themes: FeedbackTheme[];
  totalFeedback: number;
  themesFound: number;
  processingTime: number;
}

export interface CSVUploadResult {
  success: boolean;
  data?: string[];
  preview?: string[];
  filename?: string;
  totalEntries?: number;
  error?: string;
}

export interface AnalysisResponse {
  analysisId: string;
  results: AnalysisResults;
}
