import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { log } from './vite';

const { Pool } = pg;

// Initialize PostgreSQL connection pool with reconnection settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to try to connect to server before timing out
  maxUses: 7500, // Close & replace a connection after it has been used this many times (prevents memory issues)
});

// Add error handling for the pool
pool.on('error', (err: Error) => {
  log(`Unexpected database pool error: ${err.message}`, "database");
  console.error('Unexpected error on idle client', err);
});

// Check if database connection is successful
const connectToDatabase = async () => {
  let client;
  try {
    // Try to get a client from the pool
    client = await pool.connect();
    log("Successfully connected to PostgreSQL database", "database");
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(`Error connecting to PostgreSQL database: ${error.message}`, "database");
      console.error("Database connection error:", error);
    } else {
      log("Unknown database connection error", "database");
      console.error("Unknown database error:", error);
    }
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
};

// Connect to database on startup
connectToDatabase();

// Export drizzle ORM instance
export const db = drizzle(pool);