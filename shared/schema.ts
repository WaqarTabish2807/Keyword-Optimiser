import { pgTable, text, serial, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for the optimization request
export const optimizationRequest = z.object({
  content: z.string().min(1, "Content is required"),
  primaryKeywords: z.array(z.string().min(1, "Keyword cannot be empty")),
  secondaryKeywords: z.array(z.string().min(1, "Keyword cannot be empty")),
  primaryFrequency: z.number().min(0.1).max(10),
  secondaryFrequency: z.number().min(0.1).max(5),
});

export type OptimizationRequest = z.infer<typeof optimizationRequest>;

// Schema for keyword occurrence
export const keywordOccurrence = z.object({
  keyword: z.string(),
  occurrences: z.number().int().min(0),
});

export type KeywordOccurrence = z.infer<typeof keywordOccurrence>;

// Schema for the optimization response
export const optimizationResponse = z.object({
  optimizedContent: z.string(),
  primaryKeywordStats: z.array(keywordOccurrence),
  secondaryKeywordStats: z.array(keywordOccurrence),
  totalWords: z.number().int().min(0),
  wordCount: z.number().int().min(0).optional(),
});

export type OptimizationResponse = z.infer<typeof optimizationResponse>;

// Legacy User model (required by storage.ts)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
