import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { CSVUploadResult } from "@/lib/types";

interface FileUploadProps {
  onFileProcessed: (data: string[], filename: string) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileProcessed, isLoading }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; entries: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file only.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result: CSVUploadResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success && result.data) {
        setUploadedFile({
          name: file.name,
          entries: result.totalEntries || 0,
        });
        onFileProcessed(result.data, file.name);
        toast({
          title: "File uploaded successfully",
          description: `Processed ${result.totalEntries} feedback entries.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="text-blue-600 mr-3" size={20} />
          Upload Feedback Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="text-4xl text-gray-400 mb-4 mx-auto" size={48} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              CSV files only. Must contain a 'feedback' column.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            <Button
              className="mt-4"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-600" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-blue-600">
                  {uploadedFile.entries} feedback entries
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
