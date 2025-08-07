import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { ManualInput } from "@/components/manual-input";
import { DataPreview } from "@/components/data-preview";
import { AnalysisResultsComponent } from "@/components/analysis-results";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResults, AnalysisResponse } from "@/lib/types";

export default function Dashboard() {
  const [feedbackData, setFeedbackData] = useState<string[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | undefined>();
  const [analysisId, setAnalysisId] = useState<string>("");
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (feedbackEntries: string[]) => {
      const response = await apiRequest("POST", "/api/analyze-feedback", {
        feedbackEntries,
      });
      return response.json() as Promise<AnalysisResponse>;
    },
    onSuccess: (data) => {
      setAnalysisResults(data.results);
      setAnalysisId(data.analysisId);
      toast({
        title: "Analysis completed",
        description: `Identified ${data.results.themesFound} key themes from ${data.results.totalFeedback} feedback entries.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze feedback",
        variant: "destructive",
      });
    },
  });

  const handleFileProcessed = (data: string[], uploadedFilename: string) => {
    setFeedbackData(data);
    setFilename(uploadedFilename);
    setAnalysisResults(undefined);
    setAnalysisId("");
  };

  const handleManualDataChange = (entries: string[]) => {
    setFeedbackData(entries);
    setFilename("");
    setAnalysisResults(undefined);
    setAnalysisId("");
  };

  const handleAnalyze = () => {
    if (feedbackData.length === 0) {
      toast({
        title: "No data to analyze",
        description: "Please upload a CSV file or enter feedback manually.",
        variant: "destructive",
      });
      return;
    }

    if (feedbackData.length < 3) {
      toast({
        title: "Insufficient data",
        description: "Please provide at least 3 feedback entries for meaningful analysis.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate(feedbackData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Customer Exit Feedback Analysis
          </h2>
          <p className="text-gray-600">
            Upload your feedback data or paste entries manually to identify key churn reasons and generate actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUpload
              onFileProcessed={handleFileProcessed}
              isLoading={analyzeMutation.isPending}
            />

            <ManualInput
              onDataChange={handleManualDataChange}
              isLoading={analyzeMutation.isPending}
            />

            {feedbackData.length > 0 && (
              <DataPreview data={feedbackData} filename={filename} />
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || feedbackData.length === 0}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                size="lg"
              >
                <Brain className="mr-3" size={20} />
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Feedback"}
              </Button>
            </div>
          </div>

          <div>
            <AnalysisResultsComponent
              results={analysisResults}
              analysisId={analysisId}
              isLoading={analyzeMutation.isPending}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2024 DropOffLens. Powered by OpenAI GPT.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
