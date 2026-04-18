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
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      {/* Background image with dark gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      
      {/* Dark gradient overlay for better contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-orange-900/50" aria-hidden="true" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Branding Section */}
        <div className="mb-8 text-center">
         
          <h1 className="mt-4 text-4xl font-bold text-white tracking-tight">
            RevaConnect
          </h1>
          <p className="mt-2 text-lg text-orange-100 font-light">
            Connecting Students and Alumni
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Empowering REVA University's Community
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-600 mb-6">
            Sign in to access your dashboard
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 bg-white/50 placeholder-gray-400 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  🔒
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 bg-white/50 placeholder-gray-400 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Register Link */}
            <p className="text-center mt-4 text-sm text-gray-700">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>

        {/* Registration Guidance */}
        <div className="mt-8 backdrop-blur-lg bg-white/10 rounded-xl p-6 border border-white/20">
          <p className="text-sm font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">💡 Login Tip</span>
          </p>
          <p className="text-sm text-gray-200">
            Use the email address you registered with and your password to sign in.
            If you don’t have an account yet, click the Register link above to create one.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-300">
            © 2026 RevaConnect • Reva University
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Connecting talent with opportunity
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

