import { useNavigate } from "react-router-dom";

const StudentRoleDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Student Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Role-based view focused on alumni, mentorship and opportunities.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost"
          >
            Logout
          </button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-4">
            <h3 className="card-title">Alumni Directory</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder summary of how students will discover relevant alumni.
            </p>
          </section>
          <section className="card p-4">
            <h3 className="card-title">Request Mentorship</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder area describing mentorship request flows and recent
              activity.
            </p>
          </section>
          <section className="card p-4">
            <h3 className="card-title">Job Referrals</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder section for viewing referral-ready openings.
            </p>
          </section>
          <section className="card p-4">
            <h3 className="card-title">Networking Posts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder for latest alumni posts and guidance for students.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentRoleDashboard;

