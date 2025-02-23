import { users, assessments, reports, children, passwordResetTokens, type Assessment, type Report } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<typeof users.$inferSelect | undefined>;
  getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined>;
  getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(user: typeof users.$inferInsert): Promise<typeof users.$inferSelect>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  saveResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  getResetToken(token: string): Promise<{ userId: number; expiry: Date } | undefined>;
  deleteResetToken(token: string): Promise<void>;
  createChild(child: typeof children.$inferInsert): Promise<typeof children.$inferSelect>;
  getChildrenByParentId(parentId: number): Promise<typeof children.$inferSelect[]>;
  createAssessment(assessment: Omit<Assessment, "id">): Promise<Assessment>;
  getAssessmentsByUserId(userId: number): Promise<Assessment[]>;
  updateAssessment(id: number, update: Partial<Assessment>): Promise<Assessment>;
  createReport(report: Omit<Report, "id">): Promise<Report>;
  getReportByAssessmentId(assessmentId: number): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: typeof users.$inferInsert): Promise<typeof users.$inferSelect> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
  }

  async saveResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await db.insert(passwordResetTokens)
      .values({ userId, token, expiry })
      .onConflictDoUpdate({
        target: [passwordResetTokens.userId],
        set: { token, expiry }
      });
  }

  async getResetToken(token: string): Promise<{ userId: number; expiry: Date } | undefined> {
    const [resetToken] = await db.select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async deleteResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
  }

  async createChild(child: typeof children.$inferInsert): Promise<typeof children.$inferSelect> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async getChildrenByParentId(parentId: number): Promise<typeof children.$inferSelect[]> {
    return db.select().from(children).where(eq(children.parentId, parentId));
  }

  async createAssessment(assessment: Omit<Assessment, "id">): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values({
        ...assessment,
        dateCreated: new Date(),
        status: "in_progress",
      })
      .returning();
    return newAssessment;
  }

  async getAssessmentsByUserId(userId: number): Promise<Assessment[]> {
    return db.select().from(assessments).where(eq(assessments.userId, userId));
  }

  async updateAssessment(id: number, update: Partial<Assessment>): Promise<Assessment> {
    const [updated] = await db
      .update(assessments)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, id))
      .returning();

    if (!updated) throw new Error("Assessment not found");
    return updated;
  }

  async createReport(report: Omit<Report, "id">): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values({
        ...report,
        dateGenerated: new Date(),
      })
      .returning();
    return newReport;
  }

  async getReportByAssessmentId(assessmentId: number): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.assessmentId, assessmentId));
    return report;
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(reports.dateGenerated);
  }
}

export const storage = new DatabaseStorage();