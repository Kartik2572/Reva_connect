import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AlumniDirectory from "./pages/AlumniDirectory.jsx";
import JobBoard from "./pages/JobBoard.jsx";
import MentorshipRequests from "./pages/MentorshipRequests.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import NetworkingFeed from "./pages/NetworkingFeed.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AlumniRoleDashboard from "./pages/AlumniRoleDashboard.jsx";
import StudentRoleDashboard from "./pages/StudentRoleDashboard.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import AlumniVerification from "./pages/AlumniVerification.jsx";
import AdminMentorships from "./pages/AdminMentorships.jsx";
import AdminJobReferrals from "./pages/AdminJobReferrals.jsx";
import ContentModeration from "./pages/ContentModeration.jsx";
import EventManagement from "./pages/EventManagement.jsx";
import Analytics from "./pages/Analytics.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import AlumniMentorships from "./pages/AlumniMentorships.jsx";
import AlumniJobs from "./pages/AlumniJobs.jsx";
import AlumniPosts from "./pages/AlumniPosts.jsx";
import AlumniEvents from "./pages/AlumniEvents.jsx";
import AlumniProfile from "./pages/AlumniProfile.jsx";
import AlumniSettings from "./pages/AlumniSettings.jsx";
import StudentAlumni from "./pages/StudentAlumni.jsx";
import StudentMentorship from "./pages/StudentMentorship.jsx";
import StudentJobs from "./pages/StudentJobs.jsx";
import StudentFeed from "./pages/StudentFeed.jsx";
import StudentEvents from "./pages/StudentEvents.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import StudentSettings from "./pages/StudentSettings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const AppLayout = ({ children }) => {
  return (
    <div className="bg-gray-50">
      <Sidebar />
      <main className="ml-80 pt-16 min-h-screen">{children}</main>
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const hideNavbarOnLogin = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-white text-black">
      {!hideNavbarOnLogin && <Navbar />}
      <Routes>
        {/* Show login by default at root, keep landing page at /home */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <AlumniDirectory />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <JobBoard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentorship"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <MentorshipRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <EventsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <NetworkingFeed />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni-dashboard"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniRoleDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentRoleDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin feature routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <UserManagement />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alumni-verification"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <AlumniVerification />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mentorships"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <AdminMentorships />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <AdminJobReferrals />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <ContentModeration />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <EventManagement />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <ActivityLogs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRole="admin">
              <AppLayout>
                <AdminSettings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Alumni feature routes */}
        <Route
          path="/alumni/mentorships"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniMentorships />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/jobs"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniJobs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/posts"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniPosts />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/events"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniEvents />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/profile"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/settings"
          element={
            <ProtectedRoute allowedRole="alumni">
              <AppLayout>
                <AlumniSettings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Student feature routes */}
        <Route
          path="/student/alumni"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentAlumni />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/mentorship"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentMentorship />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentJobs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feed"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentFeed />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentEvents />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRole="student">
              <AppLayout>
                <StudentSettings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;

