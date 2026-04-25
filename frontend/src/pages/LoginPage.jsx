import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";
import { loginUser } from "../services/api.js";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!form.password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: form.email.trim(),
        password: form.password
      });

      const result = response.data;
      if (result.success) {
        const role = result.data?.role;
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(result.data));

        if (role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else if (role === "alumni") {
          navigate("/alumni-dashboard", { replace: true });
        } else {
          navigate("/student-dashboard", { replace: true });
        }
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error logging in. Please check your email and password."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Branding */}
        <div className="mb-10 text-center flex flex-col items-center group cursor-default">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F37021]/20 to-orange-600/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(243,112,33,0.15)] group-hover:shadow-[0_0_40px_rgba(243,112,33,0.25)] transition-all duration-500 transform group-hover:-translate-y-1">
            <svg className="w-8 h-8 text-[#F37021]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight mb-2">
            REVA-Connect
          </h1>
          <p className="text-xs text-[#F37021] font-bold tracking-[0.2em] uppercase">
            Alumni & Student Hub
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group/card hover:border-white/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-1.5">Welcome Back</h2>
            <p className="text-sm text-gray-400 font-medium">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors duration-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="name@reva.edu.in"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors duration-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md animate-fade-in">
                <div className="bg-red-500/20 p-1 rounded-full mr-3 shrink-0">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-200 leading-snug">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative flex items-center justify-center py-4 px-4 mt-6 bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,112,33,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover/btn:scale-x-100 scale-x-0 origin-left transition-transform duration-500 ease-out" />
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Platform
                    <svg className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center relative">
            <p className="text-sm text-gray-400">
              New to RevaConnect?{" "}
              <Link to="/register" className="text-[#F37021] font-bold hover:text-orange-400 transition-colors relative group/link">
                Create an account
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F37021] transition-all duration-300 group-hover/link:w-full"></span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 text-center space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            © 2026 Reva University
          </p>
          <p className="text-xs text-gray-600">
            Secure, private, and exclusive for REVA students and alumni.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

