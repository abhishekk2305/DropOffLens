export interface FeedbackTheme {
  id: string;
  name: string;
  summary: string;
  percentage: number;
  quotes: string[];
  suggestedAction: string;
  isEdited?: boolean;
}

export interface AnalysisResults {
  themes: FeedbackTheme[];
  totalFeedback: number;
  themesFound: number;
  processingTime: number;
  filters?: {
    sortBy?: 'percentage' | 'name' | 'date';
    sortOrder?: 'asc' | 'desc';
    minPercentage?: number;
    searchQuery?: string;
  };
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: User;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  owner: User;
}

export interface FeedbackAnalysis {
  id: string;
  userId: string;
  teamId?: string;
  title: string;
  description?: string;
  feedbackData: string[];
  analysisResults?: AnalysisResults;
  isShared: boolean;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
  processingTimeMs?: number;
}

export interface AnalysisComment {
  id: string;
  analysisId: string;
  userId: string;
  themeIndex?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface AnalysisWithComments extends FeedbackAnalysis {
  comments: AnalysisComment[];
  user?: User;
  team?: Team;
}

export interface ThemeFilters {
  sortBy: 'percentage' | 'name';
  sortOrder: 'asc' | 'desc';
  minPercentage: number;
  searchQuery: string;
}
