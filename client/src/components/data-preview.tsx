import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DataPreviewProps {
  data: string[];
  filename?: string;
}

export function DataPreview({ data, filename }: DataPreviewProps) {
  const previewData = data.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="text-green-600 mr-3" size={20} />
          Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {previewData.map((feedback, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                  <td className="py-2 px-3 text-gray-900">{feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing first {previewData.length} of {data.length} entries
            {filename && (
              <span className="text-gray-400"> from {filename}</span>
            )}
          </p>
          {data.length > 3 && (
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
