const JobCard = ({ job }) => {
  const statusColor =
    job.referralStatus === "Open"
      ? "bg-green-50 text-green-700 border-green-100"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="card-header">
        <div>
          <h3 className="card-title">{job.role}</h3>
          <p className="text-sm text-gray-500">{job.company}</p>
        </div>
        <span className={`badge border ${statusColor}`}>
          {job.referralStatus}
        </span>
      </div>
      <p className="text-sm text-gray-600">{job.description}</p>
      <p className="text-xs text-gray-500">
        Posted by: <span className="font-medium">{job.postedBy}</span>
      </p>
    </div>
  );
};

export default JobCard;

