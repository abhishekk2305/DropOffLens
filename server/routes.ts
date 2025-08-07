import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeFeedbackSchema, type AnalysisResults } from "@shared/schema";
import { analyzeFeedbackWithAI } from "./services/openai";
import { parseCSVContent } from "./services/csvParser";
import { generatePDFReport } from "./services/pdfGenerator";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and parse CSV file
  app.post("/api/upload-csv", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const parseResult = parseCSVContent(csvContent);

      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error });
      }

      res.json({
        success: true,
        data: parseResult.data,
        preview: parseResult.preview,
        filename: req.file.originalname,
        totalEntries: parseResult.data?.length || 0
      });
    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process CSV file" 
      });
    }
  });

  // Analyze feedback
  app.post("/api/analyze-feedback", async (req, res) => {
    try {
      const validatedData = analyzeFeedbackSchema.parse(req.body);
      
      if (validatedData.feedbackEntries.length === 0) {
        return res.status(400).json({ error: "No feedback entries provided" });
      }

      // Create analysis record
      const analysis = await storage.createFeedbackAnalysis({
        feedbackData: validatedData.feedbackEntries
      });

      // Perform AI analysis
      const startTime = Date.now();
      const results = await analyzeFeedbackWithAI(validatedData.feedbackEntries);
      const processingTimeMs = Date.now() - startTime;

      // Update analysis with results
      const updatedAnalysis = await storage.updateFeedbackAnalysisResults(
        analysis.id, 
        results, 
        processingTimeMs
      );

      res.json({
        analysisId: updatedAnalysis.id,
        results
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to analyze feedback" 
      });
    }
  });

  // Get analysis results
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await storage.getFeedbackAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json({
        id: analysis.id,
        results: analysis.analysisResults,
        createdAt: analysis.createdAt,
        processingTimeMs: analysis.processingTimeMs
      });
    } catch (error) {
      console.error('Get analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve analysis" 
      });
    }
  });

  // Export analysis to PDF
  app.get("/api/analysis/:id/pdf", async (req, res) => {
    try {
      const analysis = await storage.getFeedbackAnalysis(req.params.id);
      
      if (!analysis || !analysis.analysisResults) {
        return res.status(404).json({ error: "Analysis not found or not completed" });
      }

      const pdfHtml = generatePDFReport(analysis.analysisResults as AnalysisResults);
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="dropofflens-analysis-${analysis.id}.html"`);
      res.send(pdfHtml);
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export PDF" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
