import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Search, Calendar, Users, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import type { FeedbackAnalysis } from "@/lib/types";
import { Link } from "wouter";

export default function AnalysisHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const { user } = useAuth();

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["/api/user/analyses"],
    enabled: !!user,
  }) as { data: FeedbackAnalysis[], isLoading: boolean };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analysis.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === "completed") return matchesSearch && analysis.analysisResults;
    if (filterBy === "pending") return matchesSearch && !analysis.analysisResults;
    if (filterBy === "shared") return matchesSearch && analysis.isShared;
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your analysis history</h1>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <History className="mr-3 text-blue-600" size={32} />
            Analysis History
          </h1>
          <p className="text-gray-600">
            View and manage all your feedback analyses
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Analyses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Processing</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your analyses...</p>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterBy !== "all" ? "No matching analyses found" : "No analyses yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterBy !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start by creating your first feedback analysis"
                }
              </p>
              {!searchQuery && filterBy === "all" && (
                <Link href="/">
                  <Button>Create Analysis</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {analysis.title}
                        </h3>
                        <div className="flex gap-2">
                          {analysis.analysisResults ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Processing</Badge>
                          )}
                          {analysis.isShared && (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {analysis.description && (
                        <p className="text-gray-600 mb-3">{analysis.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(analysis.createdAt)}
                        </div>
                        {analysis.analysisResults && (
                          <div>
                            {(analysis.analysisResults as any).themesFound} themes found
                          </div>
                        )}
                        <div>
                          {Array.isArray(analysis.feedbackData) ? analysis.feedbackData.length : 0} feedback entries
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link href={`/analysis/${analysis.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}