const ContentModeration = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Content Moderation
          </h2>
          <p className="text-sm text-gray-600">
            Admin view for reviewing posts shared by alumni and removing
            inappropriate content.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Alumni Posts</h3>
          <p className="mt-2 text-sm text-gray-600">
            Placeholder area where alumni posts and moderation tools will be
            displayed.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContentModeration;

