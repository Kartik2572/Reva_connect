const AlumniSettings = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Alumni Settings
          </h2>
          <p className="text-sm text-gray-600">
            Personal preferences for notifications, visibility and mentoring
            availability.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Preferences</h3>
          <p className="mt-2 text-sm text-gray-600">
            Placeholder configuration section for controlling how you are shown
            to students and how often you are contacted.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AlumniSettings;

