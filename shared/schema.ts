import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const feedbackAnalyses = pgTable("feedback_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  feedbackData: jsonb("feedback_data").notNull(),
  analysisResults: jsonb("analysis_results"),
  createdAt: timestamp("created_at").defaultNow(),
  processingTimeMs: integer("processing_time_ms"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFeedbackAnalysisSchema = createInsertSchema(feedbackAnalyses).pick({
  feedbackData: true,
});

export const analyzeFeedbackSchema = z.object({
  feedbackEntries: z.array(z.string()).min(1, "At least one feedback entry is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type FeedbackAnalysis = typeof feedbackAnalyses.$inferSelect;
export type InsertFeedbackAnalysis = z.infer<typeof insertFeedbackAnalysisSchema>;
export type AnalyzeFeedbackRequest = z.infer<typeof analyzeFeedbackSchema>;

export interface FeedbackTheme {
  name: string;
  summary: string;
  percentage: number;
  quotes: string[];
  suggestedAction: string;
}

export interface AnalysisResults {
  themes: FeedbackTheme[];
  totalFeedback: number;
  themesFound: number;
  processingTime: number;
}
