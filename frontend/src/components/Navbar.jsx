import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.jpg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const getNavItemsForRole = () => {
    if (role === "admin") {
      return [
        { to: "/admin-dashboard", label: "Admin Panel" },
        { to: "/admin/activity", label: "Notifications" }
      ];
    }

    if (role === "alumni") {
      return [
        { to: "/alumni/mentorships", label: "My Mentorships" },
        { to: "/alumni-dashboard", label: "Notifications" }
      ];
    }

    if (role === "student") {
      return [
        { to: "/student/mentorship", label: "My Requests" },
        { to: "/student-dashboard", label: "Notifications" }
      ];
    }

    // No role / public navigation retains original student-focused links
    return [
      { to: "/dashboard", label: "Student Dashboard" },
      { to: "/alumni", label: "Alumni Directory" },
      { to: "/jobs", label: "Job Referrals" },
      { to: "/events", label: "Events" },
      { to: "/feed", label: "Networking Feed" }
    ];
  };

  const navItems = getNavItemsForRole();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#F37021] bg-orange-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-white">
        <Link to={role ? location.pathname : "/"} className="flex items-center gap-2">
          <img
            src={logo}
            alt="REVA University logo"
            className="h-10 w-auto"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">LinkEdCampus</p>
            <p className="text-xs text-gray-500">
              Alumni & Student Connect Platform
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "text-[#F37021] font-semibold border-b-2 border-[#F37021] pb-1"
                  : "hover:text-[#F37021]"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!role && (
            <>
              <NavLink
                to="/mentorship"
                className="hidden sm:inline-flex btn-ghost"
              >
                Mentorship Requests
              </NavLink>
              <Link to="/dashboard" className="btn-primary text-xs sm:text-sm">
                Go to Dashboard
              </Link>
            </>
          )}
          {role && (
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

