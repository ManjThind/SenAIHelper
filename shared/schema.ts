import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table 
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("parent"),
});

// Add avatar interface
export interface AvatarConfig {
  type: string;
  color: string;
  accessories: string[];
  name: string;
}

// Enhanced children table for PPI
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  medicalHistory: jsonb("medical_history"),
  schoolInformation: jsonb("school_information"),
  avatar: jsonb("avatar").$type<AvatarConfig>(), // Add avatar field
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Assessments table with enhanced fields
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  childId: integer("child_id").notNull(),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  facialAnalysisData: jsonb("facial_analysis_data"),
  questionnaireData: jsonb("questionnaire_data"),
  voiceAnalysisData: jsonb("voice_analysis_data"),
  status: text("status").notNull().default("in_progress"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Reports table with enhanced fields
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  childId: integer("child_id").notNull(),
  dateGenerated: timestamp("date_generated").notNull().defaultNow(),
  findings: jsonb("findings").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  followUpDate: timestamp("follow_up_date"),
  status: text("status").notNull().default("active"),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
  assessments: many(assessments),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(users, {
    fields: [children.parentId],
    references: [users.id],
  }),
  assessments: many(assessments),
  reports: many(reports),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [assessments.childId],
    references: [children.id],
  }),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  assessment: one(assessments, {
    fields: [reports.assessmentId],
    references: [assessments.id],
  }),
  child: one(children, {
    fields: [reports.childId],
    references: [children.id],
  }),
}));

// Define types for our questionnaire and voice analysis data
export interface QuestionnaireData {
  eyeContact?: string;
  nameResponse?: string;
  interactiveAssessment?: {
    questions: string[];
    responses: string[];
    analysis: {
      communication: string;
      engagement: string;
      comprehension: string;
      suggestions: string[];
    };
  };
}

export interface VoiceAnalysisData {
  pitch: number;
  volume: number;
  clarity: number;
  recordings: string[];
}

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertChildSchema = createInsertSchema(children, {
  dateOfBirth: z.coerce.date(),
});
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertReportSchema = createInsertSchema(reports, {
  followUpDate: z.coerce.date(),
  dateGenerated: z.coerce.date(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Report = typeof reports.$inferSelect;