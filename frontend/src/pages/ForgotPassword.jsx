import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";
import { forgotPassword, verifyOtp, resetPassword } from "../services/api.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer logic
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateField = (name, value, allValues) => {
    let errorMsg = "";
    if (name === "email") {
      if (!value.trim()) {
        errorMsg = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMsg = "Invalid email address.";
      }
    } else if (name === "otp") {
      if (!value.trim()) {
        errorMsg = "OTP is required.";
      } else if (value.trim().length !== 6 || !/^\d+$/.test(value)) {
        errorMsg = "OTP must be exactly 6 digits.";
      }
    } else if (name === "newPassword") {
      if (!value) {
        errorMsg = "New password is required.";
      } else if (value.length < 8) {
        errorMsg = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(value)) {
        errorMsg = "Must contain at least one uppercase letter.";
      } else if (!/[a-z]/.test(value)) {
        errorMsg = "Must contain at least one lowercase letter.";
      } else if (!/\d/.test(value)) {
        errorMsg = "Must contain at least one number.";
      } else if (!/[^A-Za-z0-9]/.test(value)) {
        errorMsg = "Must contain at least one special character.";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        errorMsg = "Confirm password is required.";
      } else if (value !== allValues.newPassword) {
        errorMsg = "Passwords do not match.";
      }
    }
    return errorMsg;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const err = validateField("email", email);
    if (err) {
      setErrors((prev) => ({ ...prev, email: err }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      if (response.data?.success) {
        setApiSuccess("OTP sent successfully!");
        setResendCooldown(60);
        setStep(2);
      } else {
        setApiError(response.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");
    const err = validateField("otp", otp);
    if (err) {
      setErrors((prev) => ({ ...prev, otp: err }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp({ email: email.trim(), otp: otp.trim() });
      if (response.data?.success) {
        setStep(3);
      } else {
        setApiError(response.data?.message || "Invalid OTP.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setApiError("");
    setApiSuccess("");
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      if (response.data?.success) {
        setApiSuccess("OTP resent successfully!");
        setResendCooldown(60);
      } else {
        setApiError(response.data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const newPassErr = validateField("newPassword", passwords.newPassword);
    const confirmPassErr = validateField("confirmPassword", passwords.confirmPassword, passwords);
    if (newPassErr || confirmPassErr) {
      setErrors((prev) => ({ ...prev, newPassword: newPassErr, confirmPassword: confirmPassErr }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({
        email: email.trim(),
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });
      if (response.data?.success) {
        setStep(4);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2500);
      } else {
        setApiError(response.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const nextPasswords = { ...passwords, [name]: value };
    setPasswords(nextPasswords);

    const fieldError = validateField(name, value, nextPasswords);
    setErrors((prev) => {
      const nextErrors = { ...prev, [name]: fieldError };
      if (name === "newPassword" && nextPasswords.confirmPassword) {
        nextErrors.confirmPassword = validateField("confirmPassword", nextPasswords.confirmPassword, nextPasswords);
      }
      return nextErrors;
    });
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight mb-2">
            REVA-Connect
          </h1>
          <p className="text-xs text-[#F37021] font-bold tracking-[0.2em] uppercase">
            Reset Password Flow
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group/card hover:border-white/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-1.5">Forgot Password</h2>
                <p className="text-sm text-gray-400 font-medium">Enter your registered email to receive an OTP</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: validateField("email", e.target.value) }));
                      }}
                      disabled={isLoading}
                      placeholder="name@reva.edu.in"
                      className={`w-full bg-white/5 border text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300 ${
                        errors.email ? "border-red-500" : "border-white/10"
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs font-semibold mt-1.5 ml-1">
                      ⚠️ {errors.email}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-sm text-red-200 leading-snug">{apiError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email || errors.email}
                  className="w-full relative flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,112,33,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:shadow-none overflow-hidden group/btn"
                >
                  <span className="relative z-10 flex items-center">
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <div>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-1.5">Verify OTP</h2>
                <p className="text-sm text-gray-400 font-medium">An OTP has been sent to {email}</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">6-Digit OTP</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtp(val);
                        setErrors((prev) => ({ ...prev, otp: validateField("otp", val) }));
                      }}
                      disabled={isLoading}
                      placeholder="123456"
                      className={`w-full bg-white/5 border text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300 tracking-[0.2em] font-mono text-center text-lg ${
                        errors.otp ? "border-red-500" : "border-white/10"
                      }`}
                      required
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-400 text-xs font-semibold mt-1.5 ml-1">
                      ⚠️ {errors.otp}
                    </p>
                  )}
                </div>

                {apiSuccess && (
                  <div className="flex items-start bg-green-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-sm text-green-200 leading-snug">{apiSuccess}</p>
                  </div>
                )}

                {apiError && (
                  <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-sm text-red-200 leading-snug">{apiError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6 || errors.otp}
                    className="w-full relative flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,112,33,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden group/btn"
                  >
                    <span className="relative z-10">Verify OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                    className="w-full py-3 text-sm text-gray-400 font-bold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend OTP Code"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <div>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-1.5">Reset Password</h2>
                <p className="text-sm text-gray-400 font-medium">Choose a secure password for your account</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300 ${
                        errors.newPassword ? "border-red-500" : "border-white/10"
                      }`}
                      required
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-400 text-xs font-semibold mt-1.5 ml-1">
                      ⚠️ {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#F37021] transition-colors duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F37021]/50 focus:border-[#F37021] focus:bg-black/40 hover:bg-white/10 transition-all duration-300 ${
                        errors.confirmPassword ? "border-red-500" : "border-white/10"
                      }`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs font-semibold mt-1.5 ml-1">
                      ⚠️ {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-sm text-red-200 leading-snug">{apiError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !passwords.newPassword || !passwords.confirmPassword || errors.newPassword || errors.confirmPassword}
                  className="w-full relative flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(243,112,33,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,112,33,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:shadow-none overflow-hidden group/btn"
                >
                  <span className="relative z-10">Reset Password</span>
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.15)] animate-bounce">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successfully</h2>
                <p className="text-sm text-gray-400 font-medium">✅ Password changed successfully.</p>
                <p className="text-xs text-gray-500 mt-4">Redirecting you to the login page...</p>
              </div>
            </div>
          )}

          {/* Back to Login link */}
          {step !== 4 && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-10 text-center space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            © 2026 Reva University
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
