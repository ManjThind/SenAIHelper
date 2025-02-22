import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("parent"),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  facialAnalysisData: jsonb("facial_analysis_data"),
  questionnaireData: jsonb("questionnaire_data"),
  voiceAnalysisData: jsonb("voice_analysis_data"),
  status: text("status").notNull().default("in_progress"),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  dateGenerated: timestamp("date_generated").notNull().defaultNow(),
  findings: jsonb("findings").notNull(),
  recommendations: jsonb("recommendations").notNull(),
});

// Define types for our questionnaire and voice analysis data
export interface QuestionnaireData {
  eyeContact?: string;
  nameResponse?: string;
}

export interface VoiceAnalysisData {
  pitch: number;
  volume: number;
  clarity: number;
  recordings: string[];
}

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  childName: true,
  childAge: true,
  userId: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  assessmentId: true,
  findings: true,
  recommendations: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Report = typeof reports.$inferSelect;