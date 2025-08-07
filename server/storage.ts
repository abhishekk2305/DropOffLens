import { type User, type InsertUser, type FeedbackAnalysis, type InsertFeedbackAnalysis, type AnalysisResults } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFeedbackAnalysis(analysis: InsertFeedbackAnalysis): Promise<FeedbackAnalysis>;
  getFeedbackAnalysis(id: string): Promise<FeedbackAnalysis | undefined>;
  updateFeedbackAnalysisResults(id: string, results: AnalysisResults, processingTimeMs: number): Promise<FeedbackAnalysis>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private feedbackAnalyses: Map<string, FeedbackAnalysis>;

  constructor() {
    this.users = new Map();
    this.feedbackAnalyses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFeedbackAnalysis(insertAnalysis: InsertFeedbackAnalysis): Promise<FeedbackAnalysis> {
    const id = randomUUID();
    const analysis: FeedbackAnalysis = {
      ...insertAnalysis,
      id,
      userId: null,
      analysisResults: null,
      createdAt: new Date(),
      processingTimeMs: null,
    };
    this.feedbackAnalyses.set(id, analysis);
    return analysis;
  }

  async getFeedbackAnalysis(id: string): Promise<FeedbackAnalysis | undefined> {
    return this.feedbackAnalyses.get(id);
  }

  async updateFeedbackAnalysisResults(id: string, results: AnalysisResults, processingTimeMs: number): Promise<FeedbackAnalysis> {
    const analysis = this.feedbackAnalyses.get(id);
    if (!analysis) {
      throw new Error(`Analysis with id ${id} not found`);
    }
    
    const updatedAnalysis: FeedbackAnalysis = {
      ...analysis,
      analysisResults: results,
      processingTimeMs,
    };
    
    this.feedbackAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
}

export const storage = new MemStorage();
