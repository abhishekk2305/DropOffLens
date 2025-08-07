import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table for collaboration
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role").notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const feedbackAnalyses = pgTable("feedback_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  title: varchar("title").notNull().default("Untitled Analysis"),
  description: text("description"),
  feedbackData: jsonb("feedback_data").notNull(),
  analysisResults: jsonb("analysis_results"),
  isShared: boolean("is_shared").default(false),
  sharedWith: jsonb("shared_with"), // Array of user IDs or team IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  processingTimeMs: integer("processing_time_ms"),
});

// Comments on analyses for collaboration
export const analysisComments = pgTable("analysis_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").references(() => feedbackAnalyses.id),
  userId: varchar("user_id").references(() => users.id),
  themeIndex: integer("theme_index"), // Which theme this comment is about (optional)
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(feedbackAnalyses),
  teamMemberships: many(teamMembers),
  ownedTeams: many(teams),
  comments: many(analysisComments),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, { fields: [teams.ownerId], references: [users.id] }),
  members: many(teamMembers),
  analyses: many(feedbackAnalyses),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const feedbackAnalysesRelations = relations(feedbackAnalyses, ({ one, many }) => ({
  user: one(users, { fields: [feedbackAnalyses.userId], references: [users.id] }),
  team: one(teams, { fields: [feedbackAnalyses.teamId], references: [teams.id] }),
  comments: many(analysisComments),
}));

export const analysisCommentsRelations = relations(analysisComments, ({ one }) => ({
  analysis: one(feedbackAnalyses, { fields: [analysisComments.analysisId], references: [feedbackAnalyses.id] }),
  user: one(users, { fields: [analysisComments.userId], references: [users.id] }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export const insertAnalysisCommentSchema = createInsertSchema(analysisComments).omit({ id: true, createdAt: true, updatedAt: true });

export const insertFeedbackAnalysisSchema = createInsertSchema(feedbackAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processingTimeMs: true,
});

export const analyzeFeedbackSchema = z.object({
  feedbackEntries: z.array(z.string()).min(1, "At least one feedback entry is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  teamId: z.string().optional(),
});

export const updateAnalysisSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isShared: z.boolean().optional(),
  sharedWith: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  themeIndex: z.number().optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type FeedbackAnalysis = typeof feedbackAnalyses.$inferSelect;
export type AnalysisComment = typeof analysisComments.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertFeedbackAnalysis = z.infer<typeof insertFeedbackAnalysisSchema>;
export type InsertAnalysisComment = z.infer<typeof insertAnalysisCommentSchema>;
export type AnalyzeFeedbackRequest = z.infer<typeof analyzeFeedbackSchema>;
export type UpdateAnalysisRequest = z.infer<typeof updateAnalysisSchema>;
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

export interface FeedbackTheme {
  id: string;
  name: string;
  summary: string;
  percentage: number;
  quotes: string[];
  suggestedAction: string;
  isEdited?: boolean;
}

export interface AnalysisResults {
  themes: FeedbackTheme[];
  totalFeedback: number;
  themesFound: number;
  processingTime: number;
  filters?: {
    sortBy?: 'percentage' | 'name' | 'date';
    sortOrder?: 'asc' | 'desc';
    minPercentage?: number;
    searchQuery?: string;
  };
}

export interface AnalysisWithComments extends FeedbackAnalysis {
  comments: (AnalysisComment & { user: User })[];
  user?: User;
  team?: Team;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[];
  owner: User;
}
