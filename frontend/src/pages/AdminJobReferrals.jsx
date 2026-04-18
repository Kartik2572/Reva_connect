const AdminJobReferrals = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Job Referrals
          </h2>
          <p className="text-sm text-gray-600">
            Admin area for monitoring and moderating referral-ready job posts
            shared by alumni.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Referral Posts</h3>
          <p className="mt-2 text-sm text-gray-600">
            Placeholder listing of all job referral posts with actions to
            archive or flag them.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminJobReferrals;

