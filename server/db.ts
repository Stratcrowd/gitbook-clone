import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Robust error handling to prevent hard crashes on cold start
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is missing. Using placeholder to prevent crash.");
  // Provide a dummy string that won't work but prevents startup crash
  connectionString = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  max: process.env.NODE_ENV === "production" ? 1 : 10,
});

// Add error listener to pool to prevent unhandled promise rejections
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit - let serverless function try to recover or fail request-only
});

export const db = drizzle(pool, { schema });
