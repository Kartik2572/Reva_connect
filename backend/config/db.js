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

// Test connection on startup and ensure schema updates exist
pool.query("SELECT NOW()", async (err, res) => {
  if (err) {
    console.error("⚠️  Database connection failed:", err.message);
    console.log("Make sure PostgreSQL is running and the database 'reva_connect' exists.");
  } else {
    console.log("✅ Database connection successful");
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS branch TEXT");
      await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS attachment_url TEXT");
      await pool.query(
        `CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_name TEXT NOT NULL,
          action TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )`
      );

      const mrCol = await pool.query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'mentorship_requests'
          AND column_name = 'student_id'
      `);
      if (mrCol.rows.length === 0) {
        await pool.query(`
          CREATE TABLE mentorship_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            mentor_id UUID NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
      } else if (mrCol.rows[0].data_type === "uuid") {
        await pool.query("DROP TABLE IF EXISTS mentorship_requests CASCADE");
        await pool.query(`
          CREATE TABLE mentorship_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            mentor_id UUID NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS job_referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          alumni_id UUID NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
          job_title TEXT NOT NULL,
          company TEXT,
          description TEXT,
          location TEXT,
          job_link TEXT,
          posted_by TEXT,
          status TEXT DEFAULT 'Active',
          is_flagged BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await pool.query(`ALTER TABLE job_referrals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'`);
      await pool.query(`ALTER TABLE job_referrals ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE job_referrals ADD COLUMN IF NOT EXISTS posted_by TEXT`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS job_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_referral_id UUID NOT NULL REFERENCES job_referrals(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'Applied',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(student_id, job_referral_id)
        )
      `);

      // Create connections table for student-to-student networking
      await pool.query(`
        CREATE TABLE IF NOT EXISTS connections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(requester_id, recipient_id)
        )
      `);

      console.log("✅ Database schema ensured");
    } catch (alterErr) {
      console.error("⚠️  Failed to ensure schema updates:", alterErr.message);
    }
  }
});
