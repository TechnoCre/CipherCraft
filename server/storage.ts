import { db } from './db';
import { users, cipherHistory, type User, type InsertUser, type CipherHistory, type InsertCipherHistory } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "./vite";

// Helper function to retry database operations
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (retries <= 0) {
      throw error;
    }
    
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.warn(`Database operation failed (${errorMessage}), retrying... (${retries} attempts left)`);
    log(`Database operation failed (${errorMessage}), retrying... (${retries} attempts left)`, "database");
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 1.5);
  }
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Added methods for cipher history
  saveCipherHistory(history: InsertCipherHistory): Promise<CipherHistory>;
  getCipherHistories(limit?: number): Promise<CipherHistory[]>;
  getCipherHistoryById(id: number): Promise<CipherHistory | undefined>;
  clearCipherHistories(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return withRetry(async () => {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    });
  }
  
  async saveCipherHistory(history: InsertCipherHistory): Promise<CipherHistory> {
    return withRetry(async () => {
      const [savedHistory] = await db
        .insert(cipherHistory)
        .values(history)
        .returning();
      return savedHistory;
    });
  }
  
  async getCipherHistories(limit: number = 10): Promise<CipherHistory[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(cipherHistory)
        .limit(limit)
        .orderBy(desc(cipherHistory.id));
    });
  }
  
  async getCipherHistoryById(id: number): Promise<CipherHistory | undefined> {
    return withRetry(async () => {
      const [history] = await db
        .select()
        .from(cipherHistory)
        .where(eq(cipherHistory.id, id));
      return history || undefined;
    });
  }
  
  async clearCipherHistories(): Promise<void> {
    return withRetry(async () => {
      await db.delete(cipherHistory);
    });
  }
}

export const storage = new DatabaseStorage();
