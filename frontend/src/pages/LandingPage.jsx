import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      <section className="reva-gradient">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 text-white md:flex-row md:items-center md:py-20">
          <div className="md:w-1/2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-100">
              Reva University
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Connect REVA alumni with
              <span className="block">ambitious B.Tech students.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-orange-50">
              RevaConnect is a dedicated platform where REVA alumni mentor,
              guide and open doors to industry opportunities for current
              students.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="btn-primary bg-white text-[#F37021] hover:bg-orange-50"
              >
                Enter Student Dashboard
              </Link>
              <Link to="/alumni" className="btn-ghost border-white text-white">
                Explore Alumni Network
              </Link>
              <Link
                to="/register"
                className="btn-primary bg-[#F37021] text-white border-[#F37021] hover:bg-orange-600"
              >
                Register
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <p className="font-semibold">1:1 Mentorship</p>
                <p className="text-orange-100">
                  Connect with senior alumni in your target domain.
                </p>
              </div>
              <div>
                <p className="font-semibold">Job Referrals</p>
                <p className="text-orange-100">
                  Access curated openings shared by alumni.
                </p>
              </div>
              <div>
                <p className="font-semibold">Industry Webinars</p>
                <p className="text-orange-100">
                  Learn from real-world experiences and journeys.
                </p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-white/95 p-4 text-gray-900">
                <p className="text-xs font-semibold text-[#F37021]">
                  For Students
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs sm:text-sm text-gray-600">
                  <li>Discover alumni working in your dream companies.</li>
                  <li>Get clarity on career paths and tech stacks.</li>
                  <li>Receive feedback on projects and resumes.</li>
                </ul>
              </div>
              <div className="card bg-white/95 p-4 text-gray-900">
                <p className="text-xs font-semibold text-[#F37021]">
                  For Alumni
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs sm:text-sm text-gray-600">
                  <li>Give back to the REVA community meaningfully.</li>
                  <li>Spot high-potential students for referrals.</li>
                  <li>Host domain-specific sessions and AMAs.</li>
                </ul>
              </div>
              <div className="col-span-2 card bg-white/95 p-4 text-gray-900">
                <p className="text-xs font-semibold text-[#F37021]">
                  Why RevaConnect?
                </p>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  Unlike generic platforms, RevaConnect is tailored for REVA
                  University&apos;s culture, curriculum and alumni base so that
                  every connection feels relevant and impactful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

