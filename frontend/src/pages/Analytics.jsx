import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  fetchAlumniByGraduationYear,
  fetchAlumniByCompany,
  fetchUserRegistrationTrends,
  fetchAdminStats,
  fetchEventStats,
  fetchUserRoleDistribution
} from "../services/api.js";

const chartColors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fef3c7", "#ea580c", "#c2410c", "#9a3412", "#7c2d12", "#431407"];

const computeAvgMonthOverMonthGrowth = (trends) => {
  if (!trends?.length || trends.length < 2) return null;
  let sum = 0;
  let n = 0;
  for (let i = 1; i < trends.length; i++) {
    const prev = trends[i - 1].count;
    const curr = trends[i].count;
    if (prev > 0) {
      sum += ((curr - prev) / prev) * 100;
      n++;
    } else if (curr > 0) {
      sum += 100;
      n++;
    }
  }
  if (n === 0) return null;
  return sum / n;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alumniByYear, setAlumniByYear] = useState([]);
  const [alumniByCompany, setAlumniByCompany] = useState([]);
  const [userTrends, setUserTrends] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [roleDistribution, setRoleDistribution] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      fetchAlumniByGraduationYear(),
      fetchAlumniByCompany(),
      fetchUserRegistrationTrends(),
      fetchAdminStats(),
      fetchEventStats(),
      fetchUserRoleDistribution()
    ])
      .then(([yearRes, companyRes, trendsRes, statsRes, eventRes, rolesRes]) => {
        if (cancelled) return;
        setAlumniByYear(yearRes.data?.data || []);
        setAlumniByCompany(companyRes.data?.data || []);
        setUserTrends(trendsRes.data?.data || []);
        setAdminStats(statsRes.data?.data || null);
        setEventStats(eventRes.data?.data || null);
        setRoleDistribution(rolesRes.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load analytics. Check that the API is running.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = useMemo(
    () => roleDistribution.reduce((sum, row) => sum + (Number(row.value) || 0), 0),
    [roleDistribution]
  );

  const avgMonthlyGrowth = useMemo(() => computeAvgMonthOverMonthGrowth(userTrends), [userTrends]);

  const alumniByYearSorted = useMemo(
    () => [...alumniByYear].sort((a, b) => Number(a.year) - Number(b.year)),
    [alumniByYear]
  );

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600">
            Platform metrics from the database: user signups, alumni breakdown, and event activity.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">Loading analytics…</p>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="card p-6">
                <h3 className="card-title mb-4">Alumni by Graduation Year</h3>
                {alumniByYear.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={alumniByYearSorted}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-sm text-gray-500">
                    No graduation year data in the database yet.
                  </p>
                )}
              </section>

              <section className="card p-6">
                <h3 className="card-title mb-4">Alumni Distribution by Company</h3>
                {alumniByCompany.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={alumniByCompany}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {alumniByCompany.map((entry, index) => (
                          <Cell key={`cell-${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-sm text-gray-500">
                    No alumni company data in the database yet.
                  </p>
                )}
              </section>
            </div>

            <section className="card mt-6 p-6">
              <h3 className="card-title mb-4">User Registrations Over Time</h3>
              <p className="mb-4 text-xs text-gray-500">
                New accounts per month (last 12 months).
              </p>
              {userTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="New users"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: "#f97316", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-gray-500">
                  No user registrations in the last 12 months, or signup dates are missing.
                </p>
              )}
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card p-4 text-center">
                <p className="text-xs font-medium text-gray-500">Total users</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{totalUsers}</p>
                <p className="mt-1 text-[11px] text-gray-400">All roles (users table)</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs font-medium text-gray-500">Avg. month-over-month growth</p>
                <p className="mt-2 text-3xl font-semibold text-[#f97316]">
                  {avgMonthlyGrowth != null ? `${avgMonthlyGrowth >= 0 ? "+" : ""}${avgMonthlyGrowth.toFixed(1)}%` : "—"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">From monthly signup trend</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs font-medium text-gray-500">Alumni (accounts)</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {adminStats?.totalAlumni ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">Users with role alumni</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs font-medium text-gray-500">Event registrations</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {eventStats?.totalRegistrations ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">Rows in event_registrations</p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
