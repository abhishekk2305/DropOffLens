import { useState } from "react";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ManualInputProps {
  onDataChange: (entries: string[]) => void;
  isLoading?: boolean;
}

export function ManualInput({ onDataChange, isLoading }: ManualInputProps) {
  const [manualFeedback, setManualFeedback] = useState("");

  const handleInputChange = (value: string) => {
    setManualFeedback(value);
    const entries = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onDataChange(entries);
  };

  const clearInput = () => {
    setManualFeedback("");
    onDataChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit3 className="text-indigo-600 mr-3" size={20} />
          Or Paste Feedback Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-32 resize-none"
          placeholder="Paste your customer feedback here, one entry per line:

The app is too slow and crashes frequently
Pricing is too expensive for small businesses
Missing key features we need for our workflow"
          value={manualFeedback}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">One feedback entry per line</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
