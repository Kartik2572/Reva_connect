import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const { Pool } = pg;

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "reva_connect",
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || "",
      port: Number(process.env.DB_PORT) || 5432,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    };

export const pool = new Pool(dbConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

// Test connection on startup
pool.query("SELECT NOW()", async (err, res) => {
  if (err) {
    console.error("⚠️  Database connection failed:", err.message);
    console.log("Make sure PostgreSQL is running and the database 'reva_connect' exists.");
  } else {
    console.log("✅ Database connection successful");
  }
});
