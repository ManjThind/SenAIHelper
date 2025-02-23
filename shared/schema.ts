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

// Add avatar interface
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


// Add relations for password reset tokens
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Export types for password reset
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;