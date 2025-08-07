import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { 
  analyzeFeedbackSchema, 
  updateAnalysisSchema,
  createCommentSchema,
  insertTeamSchema,
  type AnalysisResults 
} from "@shared/schema";
import { analyzeFeedbackWithAI } from "./services/openai";
import { parseCSVContent } from "./services/csvParser";
import { generatePDFReport } from "./services/pdfGenerator";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
  app.post("/api/analyze-feedback", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = analyzeFeedbackSchema.parse(req.body);
      
      if (validatedData.feedbackEntries.length === 0) {
        return res.status(400).json({ error: "No feedback entries provided" });
      }

      // Create analysis record
      const userId = req.user?.claims?.sub;
      const analysis = await storage.createFeedbackAnalysis({
        userId,
        teamId: validatedData.teamId || null,
        title: validatedData.title || "Untitled Analysis",
        description: validatedData.description || null,
        feedbackData: validatedData.feedbackEntries,
        analysisResults: null,
        isShared: false,
        sharedWith: null,
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
  app.get("/api/analysis/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/analysis/:id/pdf", isAuthenticated, async (req: any, res) => {
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

  // Update analysis details (title, description, sharing)
  app.patch("/api/analysis/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const analysis = await storage.getFeedbackAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Check if user owns the analysis or is a team member
      if (analysis.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this analysis" });
      }

      const validatedData = updateAnalysisSchema.parse(req.body);
      const updatedAnalysis = await storage.updateAnalysisDetails(req.params.id, validatedData);

      res.json(updatedAnalysis);
    } catch (error) {
      console.error('Update analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update analysis" 
      });
    }
  });

  // Get user's analysis history
  app.get("/api/user/analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const analyses = await storage.getUserAnalyses(userId, limit);
      
      res.json(analyses);
    } catch (error) {
      console.error('Get user analyses error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch analyses" 
      });
    }
  });

  // Team management routes
  app.post("/api/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData, userId);
      
      res.json(team);
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create team" 
      });
    }
  });

  app.get("/api/user/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const teams = await storage.getUserTeams(userId);
      
      res.json(teams);
    } catch (error) {
      console.error('Get user teams error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch teams" 
      });
    }
  });

  app.get("/api/teams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(team);
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch team" 
      });
    }
  });

  app.get("/api/teams/:id/analyses", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const analyses = await storage.getTeamAnalyses(req.params.id, limit);
      
      res.json(analyses);
    } catch (error) {
      console.error('Get team analyses error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch team analyses" 
      });
    }
  });

  // Comment system routes
  app.post("/api/analysis/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validatedData = createCommentSchema.parse(req.body);
      
      const comment = await storage.addComment({
        analysisId: req.params.id,
        userId,
        content: validatedData.content,
        themeIndex: validatedData.themeIndex || null,
      });
      
      res.json(comment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to add comment" 
      });
    }
  });

  app.get("/api/analysis/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const comments = await storage.getAnalysisComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch comments" 
      });
    }
  });

  app.patch("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const comment = await storage.updateComment(req.params.id, content);
      res.json(comment);
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update comment" 
      });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to delete comment" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
