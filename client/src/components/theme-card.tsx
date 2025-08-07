import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedbackTheme } from "@/lib/types";

interface ThemeCardProps {
  theme: FeedbackTheme;
  index: number;
}

const getThemeColor = (index: number) => {
  const colors = [
    { bg: "bg-red-100", text: "text-red-600", badge: "bg-red-100 text-red-800" },
    { bg: "bg-orange-100", text: "text-orange-600", badge: "bg-orange-100 text-orange-800" },
    { bg: "bg-yellow-100", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800" },
    { bg: "bg-green-100", text: "text-green-600", badge: "bg-green-100 text-green-800" },
    { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-800" },
    { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-100 text-purple-800" },
  ];
  return colors[index % colors.length];
};

export function ThemeCard({ theme, index }: ThemeCardProps) {
  const colors = getThemeColor(index);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center`}>
              <span className={`${colors.text} font-semibold text-sm`}>
                {index + 1}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{theme.name}</h4>
          </div>
          <Badge variant="secondary" className={colors.badge}>
            {theme.percentage}%
          </Badge>
        </div>

        <p className="text-gray-700 mb-4">{theme.summary}</p>

        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Representative Quotes:
          </h5>
          <div className="space-y-2">
            {theme.quotes.map((quote, quoteIndex) => (
              <blockquote
                key={quoteIndex}
                className="border-l-4 border-gray-300 pl-4 italic text-gray-600 text-sm"
              >
                "{quote}"
              </blockquote>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <Lightbulb className="text-blue-600 mr-2" size={16} />
            Suggested Action:
          </h5>
          <p className="text-blue-800 text-sm">{theme.suggestedAction}</p>
        </div>
      </CardContent>
    </Card>
  );
}
