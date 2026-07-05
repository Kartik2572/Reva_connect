import { useState, useEffect } from "react";
import DarkModeToggle from "../components/DarkModeToggle.jsx";
import ChangePassword from "../components/ChangePassword.jsx";
import { updateUserProfile, submitAlumniRequest, fetchMyAlumniRequest } from "../services/api.js";

const StudentSettings = () => {
  const [activeTab, setActiveTab] = useState("profile"); // profile, security, alumni
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    branch: user?.branch || ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Alumni request state
  const [alumniRequest, setAlumniRequest] = useState(null);
  const [loadingAlumni, setLoadingAlumni] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [submittingAlumni, setSubmittingAlumni] = useState(false);
  
  // Alumni request form
  const [alumniForm, setAlumniForm] = useState({
    company: "",
    role: "",
    experience: "",
    domain: "",
    location: "",
    graduationYear: "",
    branch: user?.branch || "",
    linkedinProfile: ""
  });

  // Fetch alumni request status
  const loadAlumniRequest = async () => {
    try {
      const res = await fetchMyAlumniRequest();
      if (res.data?.success) {
        setAlumniRequest(res.data.data);
      }
    } catch (err) {
      console.error("Error loading alumni request status:", err);
    } finally {
      setLoadingAlumni(false);
    }
  };

  useEffect(() => {
    loadAlumniRequest();
  }, []);

  // Pre-fill form when request status changes (especially for rejected ones)
  useEffect(() => {
    if (alumniRequest) {
      setAlumniForm({
        company: alumniRequest.company || "",
        role: alumniRequest.role || "",
        experience: alumniRequest.experience || "",
        domain: alumniRequest.domain || "",
        location: alumniRequest.location || "",
        graduationYear: alumniRequest.graduationYear || "",
        branch: alumniRequest.branchOrCompany || user?.branch || "",
        linkedinProfile: alumniRequest.linkedinProfile || ""
      });
    } else {
      setAlumniForm((prev) => ({
        ...prev,
        branch: user?.branch || ""
      }));
    }
  }, [alumniRequest, user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };



  const handleAlumniFormChange = (e) => {
    setAlumniForm({ ...alumniForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const response = await updateUserProfile(profileData);
      if (response.data?.success) {
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error) {
      setProfileMsg({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile."
      });
    } finally {
      setSavingProfile(false);
    }
  };



  const handleAlumniSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setSubmittingAlumni(true);

    if (
      !alumniForm.company?.trim() ||
      !alumniForm.role?.trim() ||
      !alumniForm.experience ||
      !alumniForm.domain?.trim() ||
      !alumniForm.location?.trim() ||
      !alumniForm.graduationYear ||
      !alumniForm.branch?.trim()
    ) {
      setModalError("All fields except LinkedIn profile are required.");
      setSubmittingAlumni(false);
      return;
    }

    try {
      const res = await submitAlumniRequest(alumniForm);
      if (res.data?.success) {
        setModalOpen(false);
        // Reload request status
        await loadAlumniRequest();
        // Update local user branch if changed
        if (alumniForm.branch.trim() !== user?.branch) {
          const updatedUser = { ...user, branch: alumniForm.branch.trim() };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setProfileData((prev) => ({ ...prev, branch: alumniForm.branch.trim() }));
        }
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmittingAlumni(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-950 font-sans min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            Manage your profile details, account security, and alumni status.
          </p>
        </header>

        {/* Settings Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Navigation Menu */}
          <aside className="space-y-6 md:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="px-3 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Account Settings
                </p>
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "profile"
                      ? "bg-orange-50 dark:bg-orange-950/20 text-[#F37021] dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "security"
                      ? "bg-orange-50 dark:bg-orange-950/20 text-[#F37021] dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </button>
              </nav>

              <div className="border-t border-gray-100 dark:border-slate-800 my-4"></div>

              <div className="px-3 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  🎓 Alumni Conversion
                </p>
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("alumni")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "alumni"
                      ? "bg-orange-50 dark:bg-orange-950/20 text-[#F37021] dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-base">🎓</span>
                  Become Alumni
                </button>
              </nav>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
              <DarkModeToggle />
            </div>
          </aside>

          {/* Settings Content Area */}
          <main className="md:col-span-3">
            {activeTab === "profile" && (
              <section className="card p-6 md:p-8">
                <h3 className="card-title text-xl font-bold mb-2">Profile Information</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  Update your display name, official email, and academic department details.
                </p>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Academic Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={profileData.branch}
                      onChange={handleProfileChange}
                      placeholder="e.g., Computer Science, Electronics, Mechanical"
                      className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  {profileMsg.text && (
                    <div
                      className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border ${
                        profileMsg.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400"
                          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                      }`}
                    >
                      <span>
                        {profileMsg.type === "success" ? "✅" : "⚠️"}
                      </span>
                      <p>{profileMsg.text}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {savingProfile ? "Saving changes..." : "Save Changes"}
                  </button>
                </form>
              </section>
            )}

            {activeTab === "security" && (
              <ChangePassword />
            )}

            {activeTab === "alumni" && (
              <section className="card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎓</span>
                  <h3 className="card-title text-xl font-bold">Alumni Conversion</h3>
                </div>
                <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-6">
                  Become an Alumni
                </p>

                {loadingAlumni ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#F37021]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading requests status...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Status Display Banners */}
                    {alumniRequest && alumniRequest.verificationStatus === "Pending" && (
                      <div className="flex items-start gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 dark:border-yellow-900/40 dark:bg-yellow-950/10">
                        <span className="text-lg mt-0.5">🟡</span>
                        <div>
                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                            Your alumni verification request is currently pending administrator approval.
                          </p>
                        </div>
                      </div>
                    )}

                    {alumniRequest && alumniRequest.verificationStatus === "Rejected" && (
                      <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/40 dark:bg-red-950/10">
                        <span className="text-lg mt-0.5">🔴</span>
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                            Your previous request was rejected.
                          </p>
                        </div>
                      </div>
                    )}

                    {alumniRequest && alumniRequest.verificationStatus === "Approved" && (
                      <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900/40 dark:bg-green-950/10">
                        <span className="text-lg mt-0.5">🟢</span>
                        <div>
                          <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                            Congratulations! Your account has been upgraded to Alumni.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Request Instructions */}
                    {(!alumniRequest || alumniRequest.verificationStatus === "Rejected") && (
                      <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-3xl p-6">
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 leading-relaxed mb-6">
                          Submit your professional details to request alumni access. Your request will be reviewed by the administrator.
                        </p>
                        
                        <button
                          type="button"
                          onClick={() => setModalOpen(true)}
                          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          {alumniRequest?.verificationStatus === "Rejected" ? "Resubmit Request" : "Become Alumni"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Alumni Request Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {alumniRequest?.verificationStatus === "Rejected" ? "Resubmit Alumni Details" : "Become Alumni Request"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                  Fill in your professional parameters for review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </header>

            {modalError && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 text-xs font-semibold text-red-800 dark:text-red-400">
                <span>⚠️</span>
                <p>{modalError}</p>
              </div>
            )}

            <form onSubmit={handleAlumniSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={alumniForm.company}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. Google, Amazon"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Current Job Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={alumniForm.role}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={alumniForm.experience}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. 3"
                    min="0"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Industry/Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={alumniForm.domain}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. Web Development"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={alumniForm.graduationYear}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. 2024"
                    min="1950"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Academic Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={alumniForm.branch}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={alumniForm.location}
                    onChange={handleAlumniFormChange}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                    LinkedIn Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={alumniForm.linkedinProfile}
                    onChange={handleAlumniFormChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/10"
                  />
                </div>
              </div>

              <footer className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAlumni}
                  className="rounded-2xl bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {submittingAlumni ? "Submitting details..." : "Submit Request"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSettings;
