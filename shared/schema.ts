import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const cipherHistory = pgTable("cipher_history", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // 'encrypt' or 'decrypt'
  algorithm: text("algorithm").notNull(),
  mode: text("mode").notNull(),
  keySize: text("key_size").notNull(),
  inputLength: integer("input_length").notNull(),
  outputLength: integer("output_length").notNull(),
  processingTime: text("processing_time").notNull(),
  inputText: text("input_text"),
  outputText: text("output_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertCipherHistorySchema = createInsertSchema(cipherHistory).pick({
  operation: true,
  algorithm: true,
  mode: true,
  keySize: true,
  inputLength: true,
  outputLength: true,
  processingTime: true,
  inputText: true,
  outputText: true,
  userId: true,
});

export type InsertCipherHistory = z.infer<typeof insertCipherHistorySchema>;
export type CipherHistory = typeof cipherHistory.$inferSelect;
