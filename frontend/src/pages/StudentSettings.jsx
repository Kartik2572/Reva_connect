const StudentSettings = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Student Settings
          </h2>
          <p className="text-sm text-gray-600">
            Configure your notification preferences and privacy settings for
            the platform.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Preferences</h3>
          <p className="mt-2 text-sm text-gray-600">
            Placeholder area where you will later adjust email alerts, feed
            preferences and visibility controls.
          </p>
        </section>
      </div>
    </div>
  );
};

export default StudentSettings;

