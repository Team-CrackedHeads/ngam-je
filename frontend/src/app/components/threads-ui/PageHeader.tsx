// Community Threads Page Header component
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
      <div>
        {/* main page title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-700">
          Community Threads
        </h1>
        {/* subtitle explaining tokens */}
        <p className="text-base sm:text-base text-gray-600 mt-1">
          Contribute tokens to boost threads and unlock premium features
        </p>
      </div>
    </div>
  );
}

export default PageHeader;