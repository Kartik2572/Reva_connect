# Job Application & Referral System - Implementation Summary

## 🎯 Overview
Complete implementation of the job application + job referral system with proper database schema, backend APIs, and React frontend.

## ✅ What's Been Implemented

### 1. DATABASE SCHEMA (Fixed)
**File:** `backend/db/schema.sql`

#### Tables Fixed:
- **job_referrals** - Alumni create job postings
  - Columns: id, alumni_id, job_title, company, description, location, job_link, created_at
  
- **job_applications** - Students apply for jobs
  - **Fixed column names**: `user_id`, `job_id` (was: student_id, job_referral_id)
  - **Fixed timestamp**: `applied_at` (was: created_at)
  - Constraints: UNIQUE(user_id, job_id) prevents duplicate applications

---

### 2. BACKEND APIS (Updated)
**File:** `backend/routes/jobRoutes.js` & `backend/controllers/jobController.js`

#### Endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs` | Get all job referrals (with optional `?studentId=X` for has_applied flag) |
| POST | `/api/jobs` | Create job referral (alumni) |
| GET | `/api/jobs/applied/:studentId` | Get student's applied jobs |
| POST | `/api/jobs/apply` | Apply for a job (student) |

#### 1. Create Job Referral
```
POST /api/jobs
Content-Type: application/json

{
  "alumni_id": "uuid-of-alumni",
  "job_title": "Software Engineer",
  "company": "TechCorp",
  "description": "5+ years experience required",
  "location": "Bangalore",
  "job_link": "https://..."
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "alumniId": "uuid",
    "jobTitle": "Software Engineer",
    "company": "TechCorp",
    "description": "...",
    "location": "Bangalore",
    "jobLink": "https://...",
    "createdAt": "2024-04-13T10:00:00Z",
    "alumniName": "John Doe",
    "hasApplied": false
  }
}
```

#### 2. Get All Jobs with Application Status
```
GET /api/jobs?studentId=1

Response: 200 OK
{
  "data": [
    {
      "id": "job-uuid-1",
      "jobTitle": "Senior Developer",
      "company": "Acme",
      "location": "Remote",
      "description": "...",
      "jobLink": "https://...",
      "createdAt": "2024-04-13T...",
      "alumniName": "Jane Smith",
      "hasApplied": true    ← Key: Shows if student applied
    },
    {
      "id": "job-uuid-2",
      "jobTitle": "Junior Designer",
      ...
      "hasApplied": false
    }
  ]
}
```

#### 3. Apply for Job
```
POST /api/jobs/apply
Content-Type: application/json

{
  "user_id": 1,
  "job_id": "job-uuid"
}

Response: 201 Created
{
  "data": {
    "id": "application-uuid",
    "userId": 1,
    "jobId": "job-uuid",
    "status": "Applied",
    "appliedAt": "2024-04-13T10:30:00Z",
    "jobTitle": "Senior Developer",
    "company": "Acme",
    "alumniName": "Jane Smith"
  }
}

Error Cases:
- 400: Invalid user_id or job_id
- 404: Job referral not found
- 409: Duplicate application (handled with ON CONFLICT)
```

#### 4. Get Student's Applied Jobs
```
GET /api/jobs/applied/1

Response: 200 OK
{
  "data": [
    {
      "id": "application-uuid",
      "userId": 1,
      "jobId": "job-uuid",
      "status": "Applied",
      "appliedAt": "2024-04-13T10:30:00Z",
      "jobTitle": "Senior Developer",
      "company": "Acme",
      "description": "...",
      "location": "Remote",
      "jobLink": "https://...",
      "alumniName": "Jane Smith"
    }
  ]
}
```

---

### 3. FRONTEND COMPONENTS (Updated)

**File:** `frontend/src/pages/StudentJobs.jsx`

#### UI Structure:
```
┌─ Job Referrals Page
│
├─ Section 1: Open Referrals (Available Jobs)
│  ├─ Job Card 1
│  │  ├─ Job Title: "Senior Developer"
│  │  ├─ Company · Location
│  │  ├─ Alumni Name
│  │  ├─ Description
│  │  ├─ "View posting" button
│  │  └─ "Apply" or "Applied" button  ← Toggle based on hasApplied
│  │
│  ├─ Job Card 2
│  └─ ...
│
└─ Section 2: My Applications
   ├─ TABLE: Showing all applied jobs
   │  ├─ Job Title
   │  ├─ Company
   │  ├─ Alumni
   │  ├─ Status (Applied/Pending/etc)
   │  └─ Applied Date
   └─ (Loads from /api/jobs/applied/:studentId)
```

#### Key Features:
- **Real-time Apply Button**: Changes from "Apply" → "Applied" (disabled)
- **Separate Sections**: Available jobs vs. applied jobs
- **has_applied Flag**: Shows which jobs student has applied for
- **Error Handling**: Shows errors when loading fails
- **Loading States**: Displays while fetching data

#### Code Implementation:
```javascript
// Fetch operations
fetchJobReferrals(studentId)        // GET /api/jobs?studentId=X
fetchJobApplicationsForStudent()    // GET /api/jobs/applied/:studentId
createJobApplication({user_id, job_id})  // POST /api/jobs/apply

// UI Updates
- hasApplied button becomes disabled after clicking
- Application added to "My applications" table
- Changes reflected instantly (no page refresh needed)
```

---

### 4. API SERVICE (Updated)
**File:** `frontend/src/services/api.js`

```javascript
// Job APIs
export const fetchJobReferrals = (studentId) =>
  api.get("/jobs", { params: { studentId } });

export const createJobReferral = (payload) => 
  api.post("/jobs", payload);

export const fetchJobApplicationsForStudent = (studentId) =>
  api.get(`/jobs/applied/${studentId}`);

export const createJobApplication = (payload) =>
  api.post("/jobs/apply", payload);
```

---

## 📋 Database Migration

See `backend/MIGRATION.md` for detailed migration instructions.

### Quick Start:
```bash
# Fresh setup
psql -U postgres -d revaconnect -f backend/db/schema.sql
```

### Key Changes:
- `student_id` → `user_id`
- `job_referral_id` → `job_id`
- `created_at` → `applied_at` (more semantic)

---

## 🧪 Testing

### 1. Test Alumni Creating Job Referral
```bash
# alumniId must be from alumniJobs
POST /api/jobs
{
  "alumni_id": "<alumni-uuid>",
  "job_title": "Full Stack Developer",
  "company": "Acme Corp",
  "description": "3+ years experience",
  "location": "Bangalore, India",
  "job_link": "https://example.com/jobs/123"
}
```

### 2. Test Student Fetching Jobs
```bash
# Student ID = 2 (assuming this is a student user)
GET /api/jobs?studentId=2
```

Expected response includes `hasApplied: true/false` for each job.

### 3. Test Applying for Job
```bash
POST /api/jobs/apply
{
  "user_id": 2,
  "job_id": "<job-uuid-from-referrals>"
}
```

### 4. Test Fetching Applied Jobs
```bash
GET /api/jobs/applied/2
```

---

## 🔧 Important Implementation Details

### 1. Duplicate Prevention
```sql
-- Unique constraint prevents duplicate applications
UNIQUE(user_id, job_id)

-- If student tries to apply twice, ON CONFLICT handles it
ON CONFLICT (user_id, job_id) 
DO UPDATE SET status = 'Applied'
```

### 2. Cascading Deletes
```sql
-- Deleting an alumni deletes their job referrals
FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE

-- Deleting a job referral deletes all applications for it
FOREIGN KEY (job_id) REFERENCES job_referrals(id) ON DELETE CASCADE
```

### 3. Frontend State Management
- `referrals` state: All available jobs (with hasApplied flag)
- `applications` state: Student's applied jobs
- Real-time updates: After apply, both states are updated
- No page refresh needed

### 4. Alumni Integration
- Alumni must have `user.alumniId` set in localStorage
- Alumni can see all their posted referrals
- Alumni name shows on student's application list

---

## 🚀 Deployment Checklist

- [ ] Run database migration (see MIGRATION.md)
- [ ] Update backend database column names
- [ ] Restart backend server
- [ ] Clear frontend cache (if needed)
- [ ] Test each endpoint with Postman/curl
- [ ] Test UI in browser
- [ ] Test error scenarios (invalid IDs, duplicates)

---

## 📝 Files Modified

1. **Backend:**
   - `backend/db/schema.sql` - Fixed table structure
   - `backend/controllers/jobController.js` - Updated queries
   - `backend/routes/jobRoutes.js` - Restructured endpoints
   - `backend/MIGRATION.md` - Migration guide (new)

2. **Frontend:**
   - `frontend/src/pages/StudentJobs.jsx` - Updated field names
   - `frontend/src/pages/AlumniJobs.jsx` - Already correct
   - `frontend/src/services/api.js` - Updated endpoints

---

## ✨ Features Summary

| Feature | Alumni | Student |
|---------|--------|---------|
| Create job referral | ✅ | ❌ |
| View all jobs | ✅ | ✅ |
| Apply for job | ❌ | ✅ |
| See application status | ❌ | ✅ |
| Track applicants | ❌ | ❌* |

*Could be added in future (admin/alumni dashboard)

---

## ⚠️ Important Notes

1. **Job Referral ID Generation**: Auto-generated by database (UUID), NOT manually set
2. **Student Role Check**: Backend validates user has 'student' role before allowing applications
3. **Alumni Integration**: Alumni profile must be linked to user account
4. **Timestamp Format**: All timestamps are ISO 8601 format (UTC)

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "has_applied is undefined" | API returning old field names | Apply database fix & restart backend |
| "Job not found" error | Using wrong UUID format | Ensure job_id is UUID from GET /api/jobs |
| "Student not found" | User doesn't have student role | Check user.role in database |
| "Alumni profile missing" | alumniId not in localStorage | Alumni must be logged in after profile verification |

---

## 📚 References

- [API Specification](#backend-apis)
- [Database Schema](#database-schema-fixed)
- [Migration Guide](./MIGRATION.md)
- Frontend: See StudentJobs.jsx and AlumniJobs.jsx

---

**Implementation Status:** ✅ COMPLETE
**Last Updated:** 2024-04-13
**Version:** 1.0
