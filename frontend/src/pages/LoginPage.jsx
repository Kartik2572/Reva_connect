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
      <div className="absolute top-1/4 left-1/4 z-0 w-64 h-64 bg-[#F37021]/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 z-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Branding */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <svg className="w-8 h-8 text-[#F37021]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
            RevaConnect
          </h1>
          <p className="text-sm text-gray-300 font-medium tracking-wide uppercase">
            Alumni & Student Hub
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-300">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors">
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
                  className="w-full bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F37021] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors">
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
                  className="w-full bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F37021] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm animate-fade-in">
                <svg className="h-5 w-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-2 text-sm text-red-200 leading-tight">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative flex items-center justify-center py-3.5 px-4 mt-2 bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-500 hover:to-[#F37021] text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(243,112,33,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Sign In to Platform"
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              New to RevaConnect?{" "}
              <Link to="/register" className="text-[#F37021] font-semibold hover:text-orange-400 transition-colors">
                Create an account
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

