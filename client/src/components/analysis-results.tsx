import { useState } from "react";
import { PieChart, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeCard } from "./theme-card";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResults } from "@/lib/types";

interface AnalysisResultsProps {
  results?: AnalysisResults;
  analysisId?: string;
  isLoading?: boolean;
}

export function AnalysisResultsComponent({ results, analysisId, isLoading }: AnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!analysisId) {
      toast({
        title: "Export failed",
        description: "No analysis data available for export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/analysis/${analysisId}/export`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `dropofflens-analysis-${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF export successful",
        description: "Analysis report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="text-purple-600 mr-3" size={20} />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Analyzing feedback...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
              </div>
            </div>
          ) : !results ? (
            <div className="text-center py-12">
              <PieChart className="text-6xl text-gray-300 mb-4 mx-auto" size={96} />
              <p className="text-gray-500 font-medium mb-2">No analysis yet</p>
              <p className="text-sm text-gray-400">
                Upload feedback data and click "Analyze Feedback" to get started
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Key Themes Identified</h3>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExporting ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Download className="mr-2" size={16} />
              )}
              Export PDF
            </Button>
          </div>

          <div className="space-y-4">
            {results.themes.map((theme, index) => (
              <ThemeCard key={index} theme={theme} index={index} />
            ))}
          </div>

          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Analysis Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{results.totalFeedback}</div>
                  <div className="text-sm text-gray-600">Total Feedback</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{results.themesFound}</div>
                  <div className="text-sm text-gray-600">Key Themes</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Analysis completed in {results.processingTime.toFixed(1)} seconds using AI-powered clustering
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
