import { parse } from 'csv-parse/sync';

export interface CSVParseResult {
  success: boolean;
  data?: string[];
  error?: string;
  preview?: string[];
}

export function parseCSVContent(csvContent: string): CSVParseResult {
  try {
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      return {
        success: false,
        error: 'CSV file is empty or invalid'
      };
    }

    // Look for feedback column (case insensitive)
    const firstRecord = records[0] as Record<string, any>;
    const headers = Object.keys(firstRecord);
    const feedbackColumn = headers.find(header => 
      header.toLowerCase().includes('feedback') ||
      header.toLowerCase().includes('comment') ||
      header.toLowerCase().includes('review') ||
      header.toLowerCase().includes('message')
    );

    if (!feedbackColumn) {
      return {
        success: false,
        error: `CSV must contain a 'feedback' column. Found columns: ${headers.join(', ')}`
      };
    }

    // Extract feedback entries
    const feedbackEntries = records
      .map(record => (record as Record<string, any>)[feedbackColumn])
      .filter(entry => entry && typeof entry === 'string' && entry.trim().length > 0)
      .map(entry => entry.trim());

    if (feedbackEntries.length === 0) {
      return {
        success: false,
        error: 'No valid feedback entries found in the CSV file'
      };
    }

    return {
      success: true,
      data: feedbackEntries,
      preview: feedbackEntries.slice(0, 5) // First 5 entries for preview
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Invalid CSV format'}`
    };
  }
}
