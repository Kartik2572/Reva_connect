# RevaConnect – College Alumni–Student Connect Platform

RevaConnect is a mock full‑stack web application that connects REVA University alumni working in industry with current B.Tech students for mentorship, networking and job referrals.

- **Frontend**: React, React Router, Axios, Tailwind CSS, Vite
- **Backend**: Node.js, Express


## Project Structure

```text
RevaConnect/
  backend/
    controllers/
    mockData/
    routes/
    package.json
    server.js
  frontend/
    src/
      components/
      pages/
      services/
      App.jsx
      main.jsx
      index.css
    index.html
    package.json
    tailwind.config.cjs
    postcss.config.cjs
    vite.config.mts
  README.md
```



### Setup & Run

```bash
cd backend
npm install
npm run dev    # starts server with nodemon on http://localhost:5000
# or
npm start      # starts server with node
```

### Available Endpoints

All endpoints return mock JSON data from in‑memory arrays in `mockData/index.js`.

- `GET /api/health` – simple health check
- `GET /api/alumni` – list of alumni (supports optional query params `company`, `domain`, `graduationYear`)
- `GET /api/jobs` – job referral posts
- `GET /api/events` – upcoming events and webinars
- `GET /api/posts` – networking feed posts
- `POST /api/mentorship-request` – accepts a mentorship request body and stores it in memory



---

## Frontend – React Single Page App

### Setup & Run

```bash
cd frontend
npm install
npm run dev    # starts Vite dev server on http://localhost:5173
```

Make sure the backend server is running on `http://localhost:5000` so the frontend can call it via Axios.

### Main Pages

- **Landing Page** – hero, about, benefits and clear CTAs for students and alumni
- **Student Dashboard** – consolidated view of:
  - Recommended alumni mentors
  - Job referrals
  - Upcoming events
  - Networking posts
- **Alumni Directory** – card‑based listing with filters for:
  - Company
  - Domain
  - Graduation year
- **Job Referral Board** – job posts with company, role, description and referral status
- **Mentorship Requests** – form for students to send mentorship requests to a specific alumni ID
- **Events & Webinars** – upcoming alumni‑hosted sessions
- **Networking Feed** – social feed of alumni posts with likes and comments (mock only)

### Reusable Components

- `Navbar` – top navigation with links to key pages
- `Sidebar` – dashboard‑style vertical navigation
- `AlumniCard` – displays alumni info and skills with a **Connect** button
- `JobCard` – job referral card with status badge
- `EventCard` – upcoming event/webinar details
- `PostCard` – networking feed posts with like/count display

All frontend data is loaded using Axios wrapper functions from `src/services/api.js`.

---

## UI & Design Notes

- University‑style theme inspired by REVA:
  - **Primary**: Orange `#F37021`
  - **Background**: White `#FFFFFF`
  - **Text**: Black `#000000`
- Built with Tailwind CSS for quick, responsive layout.
- Uses a **dashboard layout**: top `Navbar` + left `Sidebar` for application pages.
- Card‑based design for alumni, jobs, events and posts.

---

## Next Steps / Extensions

This project is intentionally minimal and mock‑driven. Typical next steps include:

- Adding proper authentication (student vs alumni roles)
- Integrating a real database (e.g. PostgreSQL, MongoDB) instead of in‑memory arrays
- Persisting likes, comments and mentorship request status
- Adding admin tools for verifying alumni and moderating posts

