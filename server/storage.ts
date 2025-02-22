import { User, Assessment, Report, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAssessment(assessment: Omit<Assessment, "id">): Promise<Assessment>;
  getAssessmentsByUserId(userId: number): Promise<Assessment[]>;
  updateAssessment(id: number, update: Partial<Assessment>): Promise<Assessment>;
  createReport(report: Omit<Report, "id">): Promise<Report>;
  getReportByAssessmentId(assessmentId: number): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assessments: Map<number, Assessment>;
  private reports: Map<number, Report>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.reports = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async createAssessment(assessment: Omit<Assessment, "id">): Promise<Assessment> {
    const id = this.currentId++;
    const newAssessment = {
      id,
      ...assessment,
      dateCreated: new Date(),
      facialAnalysisData: null,
      questionnaireData: null,
      status: "in_progress"
    } as Assessment;
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getAssessmentsByUserId(userId: number): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(
      (assessment) => assessment.userId === userId,
    );
  }

  async updateAssessment(
    id: number,
    update: Partial<Assessment>,
  ): Promise<Assessment> {
    const assessment = this.assessments.get(id);
    if (!assessment) throw new Error("Assessment not found");
    const updated = { ...assessment, ...update };
    this.assessments.set(id, updated);
    return updated;
  }

  async createReport(report: Omit<Report, "id">): Promise<Report> {
    const id = this.currentId++;
    const newReport = {
      id,
      ...report,
      dateGenerated: new Date()
    } as Report;
    this.reports.set(id, newReport);
    return newReport;
  }

  async getReportByAssessmentId(assessmentId: number): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(
      (report) => report.assessmentId === assessmentId,
    );
  }
}

export const storage = new MemStorage();