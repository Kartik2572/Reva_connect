# Database Migration Guide - Job Referrals System

## Overview
This document outlines the database schema changes made to the job referrals and job applications system.

## Changes Made

### 1. Job Applications Table Structure
The `job_applications` table has been updated to use simplified column naming:

**Before:**
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  student_id INTEGER,
  job_referral_id UUID,
  status TEXT DEFAULT 'Applied',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, job_referral_id)
);
```

**After:**
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  job_id UUID REFERENCES job_referrals(id),
  status TEXT DEFAULT 'Applied',
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
```

**Changes:**
- `student_id` → `user_id` (refers to users table)
- `job_referral_id` → `job_id` (refers to job_referrals table)
- `created_at` → `applied_at` (more semantic naming)

## Migration Steps

### Option 1: Fresh Setup (Recommended)
If you're starting fresh, simply run the schema.sql file:
```bash
psql -U postgres -d revaconnect -f backend/db/schema.sql
```

### Option 2: Migrate Existing Data
If you have existing data, follow these steps:

```sql
-- 1. Drop the old job_applications table if it exists
DROP TABLE IF EXISTS job_applications CASCADE;

-- 2. Create the new job_applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_referrals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Applied',
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
```

### Option 3: Migrate with Data Preservation
If you need to preserve existing application records:

```sql
-- 1. Create new table with updated schema
CREATE TABLE job_applications_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_referrals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Applied',
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

-- 2. Migrate data from old table
INSERT INTO job_applications_new (id, user_id, job_id, status, applied_at)
SELECT id, student_id, job_referral_id, status, created_at
FROM job_applications;

-- 3. Drop old table and rename new table
DROP TABLE job_applications;
ALTER TABLE job_applications_new RENAME TO job_applications;
```

## API Endpoint Changes

### New Endpoint Structure
- **GET /api/jobs** - Get all available jobs (with optional `?studentId=X` to show application status)
- **POST /api/jobs** - Create a new job referral (alumni only)
- **GET /api/jobs/applied/:studentId** - Get student's applied jobs
- **POST /api/jobs/apply** - Apply for a job

### Request/Response Changes

**Apply for Job (POST /api/jobs/apply)**
```javascript
// Request body
{
  user_id: 1,
  job_id: "uuid-of-job"
}

// Response
{
  data: {
    id: "uuid",
    userId: 1,
    jobId: "uuid",
    status: "Applied",
    appliedAt: "2024-04-13T10:30:00Z",
    jobTitle: "Software Engineer",
    company: "Acme",
    ...
  }
}
```

## Verification

After migration, verify the changes:

```sql
-- Check job_applications table structure
\d job_applications

-- Verify unique constraint exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name='job_applications' AND constraint_type='UNIQUE';

-- Count applications
SELECT COUNT(*) FROM job_applications;
```

## Testing Endpoints

### Test Creating Job Referral (Alumni)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "alumni_id": "uuid-of-alumni",
    "job_title": "Senior Developer",
    "company": "TechCorp",
    "description": "5+ years experience",
    "location": "Bangalore",
    "job_link": "https://..."
  }'
```

### Test Fetching Jobs (with student ID)
```bash
curl http://localhost:5000/api/jobs?studentId=1
```

### Test Applying for Job (Student)
```bash
curl -X POST http://localhost:5000/api/jobs/apply \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "job_id": "uuid-of-referral"
  }'
```

### Test Fetching Applied Jobs (Student)
```bash
curl http://localhost:5000/api/jobs/applied/1
```

## Troubleshooting

**Error: "job_applications" table does not exist**
- Run the schema migration from Option 1 or Option 2 above

**Error: Foreign key constraint violation**
- Ensure the job referral exists before applying
- Ensure the user exists and has student role

**Error: Duplicate key violation**
- A student has already applied for this job; trying to apply again is handled with ON CONFLICT

## Rollback (if needed)

If you need to rollback:
```sql
-- Drop the new schema
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_referrals CASCADE;

-- Restore from backup (if available)
-- psql -U postgres -d revaconnect -f backup_file.sql
```
