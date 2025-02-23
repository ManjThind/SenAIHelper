import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table with email field
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("parent"),
  email: text("email").notNull().unique(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  userId: integer("user_id").notNull(),
  token: text("token").notNull().primaryKey(),
  expiry: timestamp("expiry").notNull(),
});

// Assessments table
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  childId: integer("child_id").notNull(),
  status: text("status").notNull(),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  writingAnalysisData: jsonb("writing_analysis_data"),
  attentionAnalysisData: jsonb("attention_analysis_data"),
  voiceAnalysisData: jsonb("voice_analysis_data"),
  facialAnalysisData: jsonb("facial_analysis_data"),
  diagnosticData: jsonb("diagnostic_data"),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().unique(),
  dateGenerated: timestamp("date_generated").notNull(),
  findings: jsonb("findings").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  score: integer("score").notNull(),
});

// Children table
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  medicalHistory: jsonb("medical_history"),
  schoolInformation: jsonb("school_information"),
  avatar: jsonb("avatar").$type<AvatarConfig>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define interfaces and types first
export interface AvatarConfig {
  type: string;
  color: string;
  accessories: string[];
  name: string;
  effect?: string;
}

// Update the insertUserSchema to include email validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["parent", "professional", "admin"]).default("parent"),
});

// Create assessment insert schema
export const insertAssessmentSchema = createInsertSchema(assessments);

// Create report insert schema
export const insertReportSchema = createInsertSchema(reports);

// Add relations
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// First define the reports relations
export const reportsRelations = relations(reports, ({ one }) => ({
  assessment: one(assessments, {
    fields: [reports.assessmentId],
    references: [assessments.id],
  }),
}));

// Then define the assessments relations that reference reports
export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [assessments.childId],
    references: [children.id],
  }),
}));

// Export types
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;