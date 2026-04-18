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
      { to: "/alumni/profile", label: "Profile" },
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
      { to: "/student/profile", label: "Profile" },
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
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 flex-shrink-0 border-r border-gray-100 bg-white pb-6 pt-4 md:flex md:flex-col z-40">
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Navigation
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-2 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-orange-100 text-[#F37021] font-semibold"
                  : "text-gray-700 font-medium hover:bg-gray-50 hover:text-[#F37021]"
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4">
        <div className="rounded-lg bg-orange-50 p-3 text-xs text-gray-700">
          <p className="font-semibold text-[#F37021]">
            Tip for REVA Students
          </p>
          <p className="mt-1">
            Start by exploring alumni in your preferred domain and sending a
            focused mentorship request.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

