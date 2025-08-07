import { 
  type User, 
  type UpsertUser, 
  type Team,
  type TeamMember,
  type InsertTeam,
  type InsertTeamMember,
  type FeedbackAnalysis, 
  type InsertFeedbackAnalysis, 
  type AnalysisResults,
  type AnalysisComment,
  type InsertAnalysisComment,
  type AnalysisWithComments,
  type TeamWithMembers
} from "@shared/schema";
import { db } from "./db";
import { 
  users, 
  teams, 
  teamMembers, 
  feedbackAnalyses, 
  analysisComments 
} from "@shared/schema";
import { eq, desc, and, or, like, gte, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team operations
  createTeam(team: InsertTeam, ownerId: string): Promise<Team>;
  getTeam(id: string): Promise<TeamWithMembers | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember>;
  
  // Analysis operations
  createFeedbackAnalysis(analysis: InsertFeedbackAnalysis): Promise<FeedbackAnalysis>;
  getFeedbackAnalysis(id: string): Promise<AnalysisWithComments | undefined>;
  updateFeedbackAnalysisResults(id: string, results: AnalysisResults, processingTimeMs: number): Promise<FeedbackAnalysis>;
  updateAnalysisDetails(id: string, updates: Partial<FeedbackAnalysis>): Promise<FeedbackAnalysis>;
  getUserAnalyses(userId: string, limit?: number): Promise<FeedbackAnalysis[]>;
  getTeamAnalyses(teamId: string, limit?: number): Promise<FeedbackAnalysis[]>;
  getSharedAnalyses(userId: string, limit?: number): Promise<FeedbackAnalysis[]>;
  
  // Comment operations
  addComment(comment: InsertAnalysisComment): Promise<AnalysisComment>;
  getAnalysisComments(analysisId: string): Promise<(AnalysisComment & { user: User })[]>;
  updateComment(id: string, content: string): Promise<AnalysisComment>;
  deleteComment(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team operations
  async createTeam(team: InsertTeam, ownerId: string): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values({ ...team, ownerId })
      .returning();
    
    // Add owner as team member
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: ownerId,
      role: "owner",
    });
    
    return newTeam;
  }

  async getTeam(id: string): Promise<TeamWithMembers | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    
    if (!team) return undefined;

    const members = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: users,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, id));

    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, team.ownerId!));

    return {
      ...team,
      members: members.map(m => ({ ...m, user: m.user })),
      owner,
    };
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const userTeams = await db
      .select({
        team: teams,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));

    return userTeams.map(ut => ut.team);
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );
  }

  async updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({ role })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      )
      .returning();
    return updatedMember;
  }

  // Analysis operations
  async createFeedbackAnalysis(analysis: InsertFeedbackAnalysis): Promise<FeedbackAnalysis> {
    const [newAnalysis] = await db
      .insert(feedbackAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getFeedbackAnalysis(id: string): Promise<AnalysisWithComments | undefined> {
    const [analysis] = await db
      .select()
      .from(feedbackAnalyses)
      .where(eq(feedbackAnalyses.id, id));
    
    if (!analysis) return undefined;

    const comments = await this.getAnalysisComments(id);
    const user = analysis.userId ? await this.getUser(analysis.userId) : undefined;
    const team = analysis.teamId ? await db.select().from(teams).where(eq(teams.id, analysis.teamId)).then(t => t[0]) : undefined;

    return {
      ...analysis,
      comments,
      user,
      team,
    };
  }

  async updateFeedbackAnalysisResults(id: string, results: AnalysisResults, processingTimeMs: number): Promise<FeedbackAnalysis> {
    const [updatedAnalysis] = await db
      .update(feedbackAnalyses)
      .set({
        analysisResults: results,
        processingTimeMs,
        updatedAt: new Date(),
      })
      .where(eq(feedbackAnalyses.id, id))
      .returning();
    
    if (!updatedAnalysis) {
      throw new Error(`Analysis with id ${id} not found`);
    }
    
    return updatedAnalysis;
  }

  async updateAnalysisDetails(id: string, updates: Partial<FeedbackAnalysis>): Promise<FeedbackAnalysis> {
    const [updatedAnalysis] = await db
      .update(feedbackAnalyses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(feedbackAnalyses.id, id))
      .returning();
    
    if (!updatedAnalysis) {
      throw new Error(`Analysis with id ${id} not found`);
    }
    
    return updatedAnalysis;
  }

  async getUserAnalyses(userId: string, limit: number = 50): Promise<FeedbackAnalysis[]> {
    return await db
      .select()
      .from(feedbackAnalyses)
      .where(eq(feedbackAnalyses.userId, userId))
      .orderBy(desc(feedbackAnalyses.createdAt))
      .limit(limit);
  }

  async getTeamAnalyses(teamId: string, limit: number = 50): Promise<FeedbackAnalysis[]> {
    return await db
      .select()
      .from(feedbackAnalyses)
      .where(eq(feedbackAnalyses.teamId, teamId))
      .orderBy(desc(feedbackAnalyses.createdAt))
      .limit(limit);
  }

  async getSharedAnalyses(userId: string, limit: number = 50): Promise<FeedbackAnalysis[]> {
    // Get analyses shared with the user
    return await db
      .select()
      .from(feedbackAnalyses)
      .where(
        and(
          eq(feedbackAnalyses.isShared, true),
          // This is a simplified version - in production you'd parse the JSONB sharedWith field
        )
      )
      .orderBy(desc(feedbackAnalyses.createdAt))
      .limit(limit);
  }

  // Comment operations
  async addComment(comment: InsertAnalysisComment): Promise<AnalysisComment> {
    const [newComment] = await db
      .insert(analysisComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getAnalysisComments(analysisId: string): Promise<(AnalysisComment & { user: User })[]> {
    const comments = await db
      .select({
        comment: analysisComments,
        user: users,
      })
      .from(analysisComments)
      .innerJoin(users, eq(analysisComments.userId, users.id))
      .where(eq(analysisComments.analysisId, analysisId))
      .orderBy(analysisComments.createdAt);

    return comments.map(c => ({ ...c.comment, user: c.user }));
  }

  async updateComment(id: string, content: string): Promise<AnalysisComment> {
    const [updatedComment] = await db
      .update(analysisComments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(analysisComments.id, id))
      .returning();
    
    if (!updatedComment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    return updatedComment;
  }

  async deleteComment(id: string): Promise<void> {
    await db
      .delete(analysisComments)
      .where(eq(analysisComments.id, id));
  }
}

export const storage = new DatabaseStorage();
