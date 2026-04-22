import { NavLink } from "react-router-dom";

// Determine menu items based on role in localStorage
const getNavItemsForRole = () => {
  let role = null;
  if (typeof window !== "undefined") {
    role = localStorage.getItem("role");
  }

  if (role === "admin") {
    return [
      { to: "/admin-dashboard", label: "Dashboard" },
      { to: "/admin/users", label: "User Management" },
      { to: "/admin/alumni-verification", label: "Alumni Verification" },
      { to: "/admin/mentorships", label: "Mentorship Requests" },
      { to: "/admin/jobs", label: "Job Referrals" },
      { to: "/admin/posts", label: "Content Moderation" },
      { to: "/admin/events", label: "Event Management" },
      { to: "/admin/analytics", label: "Analytics" },
      { to: "/admin/activity", label: "Activity Logs" },
      { to: "/admin/settings", label: "Settings" }
    ];
  }

  if (role === "alumni") {
    return [
      { to: "/alumni-dashboard", label: "Dashboard" },
      { to: "/alumni/mentorships", label: "Mentorship Requests" },
      { to: "/alumni/jobs", label: "Job Referrals" },
      { to: "/alumni/posts", label: "Create Post" },
      { to: "/alumni/events", label: "Events" },
      { to: "/alumni/settings", label: "Settings" }
    ];
  }

  if (role === "student") {
    return [
      { to: "/student-dashboard", label: "Dashboard" },
      { to: "/student/alumni", label: "Alumni Directory" },
      { to: "/student/mentorship", label: "Mentorship Requests" },
      { to: "/student/jobs", label: "Job Referrals" },
      { to: "/student/feed", label: "Networking Feed" },
      { to: "/student/events", label: "Events & Webinars" },
      { to: "/student/settings", label: "Settings" }
    ];
  }

  // Default / public sidebar menu (existing behavior)
  return [
    { to: "/dashboard", label: "Student Dashboard" },
    { to: "/alumni", label: "Alumni Directory" },
    { to: "/jobs", label: "Job Referrals" },
    { to: "/mentorship", label: "Mentorship Requests" },
    { to: "/events", label: "Events & Webinars" },
    { to: "/feed", label: "Networking Feed" }
  ];
};

const Sidebar = () => {
  const navItems = getNavItemsForRole();
  return (
    <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-80 flex-shrink-0 border-r border-gray-100/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl pb-6 pt-6 md:flex md:flex-col z-40 shadow-[4px_0_24px_rgb(0,0,0,0.02)] transition-all duration-300">
      <div className="px-6 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
          Navigation
        </p>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-4 py-3 transition-all duration-300 group",
                isActive
                  ? "bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 text-[#F37021] dark:text-orange-400 font-bold shadow-sm border border-orange-100/50 dark:border-orange-800/50"
                  : "text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              ].join(" ")
            }
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${window.location.pathname === item.to ? 'bg-[#F37021] dark:bg-orange-400' : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600'}`}></span>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-6">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 p-5 text-xs text-gray-600 dark:text-gray-400 border border-orange-100/50 dark:border-orange-800/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-[#F37021]/10 dark:bg-[#F37021]/20 rounded-full blur-xl group-hover:bg-[#F37021]/20 dark:group-hover:bg-[#F37021]/30 transition-colors duration-500"></div>
          <p className="font-bold text-[#F37021] dark:text-orange-400 text-sm flex items-center gap-2 mb-2 relative z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Quick Tip
          </p>
          <p className="mt-1 leading-relaxed font-medium relative z-10">
            Start by exploring alumni in your preferred domain and sending a
            focused mentorship request.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

