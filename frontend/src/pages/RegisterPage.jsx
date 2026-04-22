import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";
import { registerUser } from "../services/api.js";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    branch: "",
    graduationYear: "",
    company: "",
    experience: "",
    domain: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: value
      };

      if (name === "role") {
        if (value === "admin") {
          nextState.branch = "";
          nextState.graduationYear = "";
          nextState.company = "";
          nextState.experience = "";
          nextState.domain = "";
          nextState.location = "";
        }

        if (value !== "alumni") {
          nextState.graduationYear = "";
          nextState.company = "";
          nextState.experience = "";
          nextState.domain = "";
          nextState.location = "";
        }
      }

      return nextState;
    });

    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (["student", "alumni"].includes(formData.role) && !formData.branch.trim()) {
      setError("Branch is required for student and alumni roles");
      return false;
    }

    if (formData.role === "alumni") {
      if (!formData.company.trim()) {
        setError("Company name is required for alumni");
        return false;
      }

      if (!formData.graduationYear.trim()) {
        setError("Graduation year is required for alumni");
        return false;
      }

      const year = Number(formData.graduationYear);
      if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 5) {
        setError("Enter a valid graduation year");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        branch: formData.branch,
        graduationYear: formData.role === "alumni" ? formData.graduationYear : null,
        company: formData.role === "alumni" ? formData.company.trim() : null,
        experience: formData.role === "alumni" ? formData.experience : null,
        domain: formData.role === "alumni" ? formData.domain : null,
        location: formData.role === "alumni" ? formData.location : null
      });

      if (response.data && response.data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
          branch: "",
          graduationYear: "",
          company: "",
          experience: "",
          domain: "",
          location: ""
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data?.message || "Registration failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error registering user. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper classes for inputs
  const labelClass = "text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 mb-2 block";
  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden font-sans">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-[#F37021]/30 backdrop-blur-sm" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 z-0 w-[400px] h-[400px] bg-[#F37021]/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 z-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">
        {/* Branding */}
        <div className="mb-10 text-center flex flex-col items-center group cursor-default">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F37021]/20 to-orange-600/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(243,112,33,0.15)] group-hover:shadow-[0_0_40px_rgba(243,112,33,0.25)] transition-all duration-500 transform group-hover:-translate-y-1">
            <svg className="w-8 h-8 text-[#F37021]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight mb-2">
            RevaConnect
          </h1>
          <p className="text-xs text-[#F37021] font-bold tracking-[0.2em] uppercase">
            Join the Network
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group/card hover:border-white/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-1.5">Create Account</h2>
            <p className="text-sm text-gray-400 font-medium">Get started with your alumni or student profile</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-start bg-green-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-md animate-fade-in">
              <div className="bg-green-500/20 p-1 rounded-full mr-3 shrink-0">
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-green-200 leading-snug">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md animate-fade-in">
              <div className="bg-red-500/20 p-1 rounded-full mr-3 shrink-0">
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-sm text-red-200 leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={inputClass} disabled={loading} />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} disabled={loading} />
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className={labelClass}>I am a</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className={`${inputClass} appearance-none [&>option]:bg-gray-900 [&>option]:text-white`} disabled={loading}>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Branch Field */}
            { ["student", "alumni"].includes(formData.role) && (
              <div className="animate-fade-in">
                <label htmlFor="branch" className={labelClass}>Branch</label>
                <input type="text" id="branch" name="branch" value={formData.branch} onChange={handleChange} placeholder="Enter your branch" className={inputClass} disabled={loading} />
              </div>
            )}

            {/* Graduation Year and Alumni Details */}
            {formData.role === "alumni" && (
              <div className="space-y-5 animate-fade-in border-l-2 border-[#F37021]/30 pl-4 mt-2">
                <div>
                  <label htmlFor="company" className={labelClass}>Company name</label>
                  <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Acme Corp" className={inputClass} disabled={loading} required />
                </div>
                <div>
                  <label htmlFor="graduationYear" className={labelClass}>Graduation Year</label>
                  <input type="number" id="graduationYear" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="e.g. 2024" className={inputClass} disabled={loading} />
                </div>
                <div>
                  <label htmlFor="experience" className={labelClass}>Experience</label>
                  <input type="text" id="experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 3 years in product engineering" className={inputClass} disabled={loading} />
                </div>
                <div>
                  <label htmlFor="domain" className={labelClass}>Domain</label>
                  <input type="text" id="domain" name="domain" value={formData.domain} onChange={handleChange} placeholder="e.g. Software, Finance" className={inputClass} disabled={loading} />
                </div>
                <div>
                  <label htmlFor="location" className={labelClass}>Location</label>
                  <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, Remote" className={inputClass} disabled={loading} />
                </div>
              </div>
            )}

            {/* Password Fields in a grid for larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" className={inputClass} disabled={loading} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={inputClass} disabled={loading} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center py-4 px-4 mt-8 bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,112,33,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover/btn:scale-x-100 scale-x-0 origin-left transition-transform duration-500 ease-out" />
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Register
                    <svg className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-[#F37021] font-bold hover:text-orange-400 transition-colors relative group/link">
                Login here
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F37021] transition-all duration-300 group-hover/link:w-full"></span>
              </Link>
            </p>
            <div className="mt-4">
              <Link to="/home" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 group/back">
                <svg className="w-4 h-4 transform group-hover/back:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
