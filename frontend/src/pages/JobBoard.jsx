import { useEffect, useState } from "react";
import { fetchJobs } from "../services/api.js";
import JobCard from "../components/JobCard.jsx";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs()
      .then((res) => setJobs(res.data.data))
      .catch(() => setJobs([]));
  }, []);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Job Referral Board
          </h2>
          <p className="text-sm text-gray-600">
            Browse referral-ready openings shared by alumni.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-gray-500">
              No job posts found. Ensure the backend server is running.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard;

