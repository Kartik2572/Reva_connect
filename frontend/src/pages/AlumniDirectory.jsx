import { useEffect, useState } from "react";
import { fetchAlumni } from "../services/api.js";
import AlumniCard from "../components/AlumniCard.jsx";

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    company: "",
    domain: "",
    graduationYear: "",
    branch: "",
    location: "",
    verificationStatus: ""
  });

  useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = (params) => {
    fetchAlumni(params)
      .then((res) => setAlumni(res.data?.data || []))
      .catch(() => setAlumni([]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );
    loadAlumni(activeFilters);
  };

  const handleClear = () => {
    setFilters({
      search: "",
      company: "",
      domain: "",
      graduationYear: "",
      branch: "",
      location: "",
      verificationStatus: ""
    });
    loadAlumni();
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Alumni Directory
          </h2>
          <p className="text-sm text-gray-600">
            Explore REVA alumni across companies, domains and batches.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="card mb-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="Name, company, domain…"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={filters.company}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="e.g. Google"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Domain
            </label>
            <input
              type="text"
              name="domain"
              value={filters.domain}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="e.g. Backend, Cloud"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Graduation Year
            </label>
            <input
              type="number"
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="e.g. 2020"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Branch
            </label>
            <input
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="Program / branch"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="e.g. Remote"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700">
              Verification
            </label>
            <select
              name="verificationStatus"
              value={filters.verificationStatus}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
            >
              <option value="">Any</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button type="submit" className="btn-primary w-full">
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost w-full"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {alumni.map((a) => (
            <AlumniCard key={a.id} alumni={a} />
          ))}
          {alumni.length === 0 && (
            <p className="text-sm text-gray-500">
              No alumni found. Try adjusting your filters or ensure the backend
              server is running.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectory;

