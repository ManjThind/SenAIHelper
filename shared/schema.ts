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
  effect?: string; // Added effect property
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

// Add writing analysis interface
export interface WritingAnalysisData {
  metrics: {
    legibility: number;
    consistency: number;
    spacing: number;
    alignment: number;
    pressure: number;
  };
  suggestions: string[];
  overallScore: number;
  timestamp: string;
}

// Add attention analysis interface
export interface AttentionAnalysisData {
  metrics: {
    focusDuration: number;
    trackingAccuracy: number;
    distractibility: number;
    responseTime: number;
  };
  suggestions: string[];
  overallScore: number;
  timestamp: string;
}

// Add facial analysis interface
export interface FacialAnalysisData {
  metrics: {
    happiness: number;
    sadness: number;
    anger: number;
    surprise: number;
    neutral: number;
    fear: number;
  };
  suggestions: string[];
  overallScore: number;
  timestamp: string;
}

// Update assessments table
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  childId: integer("child_id").notNull(),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  facialAnalysisData: jsonb("facial_analysis_data").$type<FacialAnalysisData | null>(),
  questionnaireData: jsonb("questionnaire_data"),
  voiceAnalysisData: jsonb("voice_analysis_data"),
  writingAnalysisData: jsonb("writing_analysis_data").$type<WritingAnalysisData | null>(),
  attentionAnalysisData: jsonb("attention_analysis_data").$type<AttentionAnalysisData | null>(),
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

// Add shop-related interfaces
export interface ShopItem {
  id: string;
  name: string;
  type: "glasses" | "hat" | "bowtie" | "cape";
  price: number;
  description: string;
  isFreeWeekly: boolean;
  weekStartDate?: Date;
  weekEndDate?: Date;
}

// Add shop tables
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  isFreeWeekly: boolean("is_free_weekly").notNull().default(false),
  weekStartDate: timestamp("week_start_date"),
  weekEndDate: timestamp("week_end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ownedItems = pgTable("owned_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
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

// Add relations
export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  ownedItems: many(ownedItems),
}));

export const ownedItemsRelations = relations(ownedItems, ({ one }) => ({
  user: one(users, {
    fields: [ownedItems.userId],
    references: [users.id],
  }),
  item: one(shopItems, {
    fields: [ownedItems.itemId],
    references: [shopItems.id],
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
// Update the insertChildSchema to properly handle date conversion
export const insertChildSchema = createInsertSchema(children, {
  dateOfBirth: z.string()
    .transform((str) => new Date(str))
    .refine((date) => {
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 0 && age <= 18;
    }, "Child must be between 0 and 18 years old"),
  parentId: z.number(),
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s-]+$/, "First name can only contain letters, spaces, and hyphens"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s-]+$/, "Last name can only contain letters, spaces, and hyphens"),
  gender: z.string()
    .min(1, "Please select a gender")
    .refine((val) => ["male", "female", "other"].includes(val), "Invalid gender selection"),
  medicalHistory: z.record(z.any()).optional().default({}),
  schoolInformation: z.record(z.any()).optional().default({}),
  avatar: z.object({
    type: z.string().min(1, "Please select an avatar type"),
    color: z.string().min(1, "Please select a color"),
    accessories: z.array(z.string()),
    name: z.string().max(50, "Avatar name cannot exceed 50 characters"),
  }).optional().default({
    type: "robot",
    color: "blue",
    accessories: [],
    name: "",
  }),
});
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertReportSchema = createInsertSchema(reports, {
  followUpDate: z.coerce.date(),
  dateGenerated: z.coerce.date(),
});

// Create insert schemas for new tables
export const insertShopItemSchema = createInsertSchema(shopItems);
export const insertOwnedItemSchema = createInsertSchema(ownedItems);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Report = typeof reports.$inferSelect;

// Export types for new tables
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type InsertOwnedItem = z.infer<typeof insertOwnedItemSchema>;
export type ShopItemSelect = typeof shopItems.$inferSelect;
export type OwnedItemSelect = typeof ownedItems.$inferSelect;