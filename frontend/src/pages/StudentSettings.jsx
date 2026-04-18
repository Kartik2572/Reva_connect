import DarkModeToggle from "../components/DarkModeToggle.jsx";

const StudentSettings = () => {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Student Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Configure your notification preferences and privacy settings for the platform.
          </p>
        </header>
        <div className="space-y-6">
          <DarkModeToggle />
          <section className="card p-4">
            <h3 className="card-title">Preferences</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Use the dark mode toggle to switch the app theme for low-light viewing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;

