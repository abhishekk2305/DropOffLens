import { TrendingUp, Users, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">DropOffLens</h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Customer Exit Feedback Into
            <span className="text-blue-600"> Actionable Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Use AI-powered analysis to identify key churn reasons, discover patterns in customer feedback, 
            and generate data-driven strategies to improve retention.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="text-blue-600 mr-3" size={24} />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced AI clustering identifies common themes and patterns in customer feedback automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="text-green-600 mr-3" size={24} />
                Visual Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Interactive charts and visualizations make it easy to understand feedback trends and priorities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="text-purple-600 mr-3" size={24} />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share analyses with your team, add comments, and collaborate on action plans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="text-orange-600 mr-3" size={24} />
                Actionable Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get specific, actionable recommendations for each identified theme to address customer concerns.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to reduce customer churn?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of product teams using DropOffLens to turn feedback into retention.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="px-12 py-4 text-lg"
          >
            Start Analyzing Today
          </Button>
        </div>
      </main>
    </div>
  );
}