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
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to={role ? location.pathname : "/"} className="flex items-center gap-3 group">
          <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 group-hover:shadow-md transition-shadow">
            <img
              src={logo}
              alt="REVA University logo"
              className="h-12 w-auto object-contain transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">RevaConnect</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#F37021] dark:text-orange-400">
              Alumni & Student Connect
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex bg-gray-50/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-gray-100 dark:border-slate-700">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-[#F37021] dark:text-orange-400 font-bold shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {!role && (
            <>
              <NavLink
                to="/mentorship"
                className="hidden sm:inline-flex text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Mentorship Requests
              </NavLink>
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </>
          )}
          {role && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 flex items-center justify-center text-[#F37021] dark:text-orange-400 font-bold border border-orange-200/50 dark:border-orange-700/50">
                  {role === "admin" ? "A" : role === "alumni" ? "AL" : "S"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">{role}</span>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Active Session</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-800/50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

