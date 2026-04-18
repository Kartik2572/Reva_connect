import { useEffect, useState, useCallback } from "react";
import { fetchAlumni } from "../services/api.js";
import AlumniCard from "../components/AlumniCard.jsx";

const newEmptyFilters = () => ({
  search: "",
  company: "",
  domain: "",
  graduationYear: "",
  branch: "",
  location: "",
  verificationStatus: ""
});

const StudentAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState(newEmptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(newEmptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buildQueryParams = useCallback((f) => {
    const params = {};
    if (f.search.trim()) params.search = f.search.trim();
    if (f.company.trim()) params.company = f.company.trim();
    if (f.domain.trim()) params.domain = f.domain.trim();
    if (f.branch.trim()) params.branch = f.branch.trim();
    if (f.location.trim()) params.location = f.location.trim();
    if (f.graduationYear.trim()) params.graduationYear = f.graduationYear.trim();
    if (f.verificationStatus.trim()) params.verificationStatus = f.verificationStatus.trim();
    return params;
  }, []);

  const loadAlumni = useCallback(
    async (f) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchAlumni(buildQueryParams(f));
        setAlumni(res.data?.data || []);
      } catch {
        setAlumni([]);
        setError("Could not load alumni. Check that the server is running.");
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams]
  );

  useEffect(() => {
    loadAlumni(appliedFilters);
  }, [appliedFilters, loadAlumni]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const cleared = newEmptyFilters();
    setFilters(cleared);
    setAppliedFilters({ ...cleared });
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Alumni Directory</h2>
          <p className="text-sm text-gray-600">
            Alumni who have registered on RevaConnect (linked to an alumni account). Use filters to
            narrow by company, domain, batch, and more.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={handleApplyFilters}
          className="card mb-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
            <label htmlFor="search" className="block text-xs font-medium text-gray-700">
              Search
            </label>
            <input
              id="search"
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, company, domain, or branch…"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-xs font-medium text-gray-700">
              Company
            </label>
            <input
              id="company"
              type="text"
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
              placeholder="e.g. Acme"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="domain" className="block text-xs font-medium text-gray-700">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              name="domain"
              value={filters.domain}
              onChange={handleFilterChange}
              placeholder="e.g. Cloud, Finance"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-xs font-medium text-gray-700">
              Graduation year
            </label>
            <input
              id="graduationYear"
              type="number"
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleFilterChange}
              placeholder="e.g. 2022"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="branch" className="block text-xs font-medium text-gray-700">
              Branch
            </label>
            <input
              id="branch"
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              placeholder="Program / branch"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-xs font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g. Bangalore"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            />
          </div>
          <div>
            <label htmlFor="verificationStatus" className="block text-xs font-medium text-gray-700">
              Verification
            </label>
            <select
              id="verificationStatus"
              name="verificationStatus"
              value={filters.verificationStatus}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            >
              <option value="">Any</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <button type="submit" className="btn-primary px-6">
              Apply filters
            </button>
            <button type="button" onClick={handleClearFilters} className="btn-ghost px-6">
              Clear all
            </button>
          </div>
        </form>

        <section className="card p-4">
          <div className="card-header mb-4">
            <h3 className="card-title">
              {loading ? "Loading…" : `Alumni (${alumni.length})`}
            </h3>
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading alumni directory…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alumni.length > 0 ? (
                alumni.map((a) => <AlumniCard key={a.id} alumni={a} />)
              ) : (
                <p className="col-span-full py-8 text-center text-sm text-gray-500">
                  No alumni match these filters. Try clearing filters or different keywords.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentAlumni;
