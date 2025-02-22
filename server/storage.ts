import { User, Assessment, Report, InsertUser, Child, InsertChild, children, users, assessments, reports } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createChild(child: InsertChild): Promise<Child>;
  getChildrenByParentId(parentId: number): Promise<Child[]>;
  createAssessment(assessment: Omit<Assessment, "id">): Promise<Assessment>;
  getAssessmentsByUserId(userId: number): Promise<Assessment[]>;
  updateAssessment(id: number, update: Partial<Assessment>): Promise<Assessment>;
  createReport(report: Omit<Report, "id">): Promise<Report>;
  getReportByAssessmentId(assessmentId: number): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async getChildrenByParentId(parentId: number): Promise<Child[]> {
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
}

export const storage = new DatabaseStorage();