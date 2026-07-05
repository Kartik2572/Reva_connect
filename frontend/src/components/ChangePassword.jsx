import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword as changePasswordApi } from "../services/api.js";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saving, setSaving] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: "", text: "" });

  const validateField = (name, value, currentFormData) => {
    let errorMsg = "";
    if (name === "currentPassword") {
      if (!value) {
        errorMsg = "Current password is required.";
      }
    } else if (name === "newPassword") {
      if (!value) {
        errorMsg = "New password is required.";
      } else if (value.length < 8) {
        errorMsg = "New password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(value)) {
        errorMsg = "New password must contain at least one uppercase letter.";
      } else if (!/[a-z]/.test(value)) {
        errorMsg = "New password must contain at least one lowercase letter.";
      } else if (!/\d/.test(value)) {
        errorMsg = "New password must contain at least one number.";
      } else if (!/[^A-Za-z0-9]/.test(value)) {
        errorMsg = "New password must contain at least one special character.";
      } else if (currentFormData.currentPassword && value === currentFormData.currentPassword) {
        errorMsg = "New password must differ from current password.";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        errorMsg = "Confirm password is required.";
      } else if (value !== currentFormData.newPassword) {
        errorMsg = "Passwords do not match.";
      }
    }
    return errorMsg;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    // Perform validation immediately
    const fieldError = validateField(name, value, nextFormData);
    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors, [name]: fieldError };

      // Reactive checking for dependent fields:
      // 1. If we changed newPassword, we must re-evaluate confirmPassword
      if (name === "newPassword") {
        if (nextFormData.confirmPassword) {
          nextErrors.confirmPassword = validateField("confirmPassword", nextFormData.confirmPassword, nextFormData);
        }
      }
      // 2. If we changed currentPassword, we must re-evaluate newPassword's 'must differ' rule
      if (name === "currentPassword") {
        if (nextFormData.newPassword) {
          nextErrors.newPassword = validateField("newPassword", nextFormData.newPassword, nextFormData);
        }
      }

      return nextErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage({ type: "", text: "" });

    // Validate all fields again
    const currentErrors = {
      currentPassword: validateField("currentPassword", formData.currentPassword, formData),
      newPassword: validateField("newPassword", formData.newPassword, formData),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData)
    };

    setErrors(currentErrors);

    const hasErrors = Object.values(currentErrors).some((err) => err !== "");
    if (hasErrors) {
      return;
    }

    setSaving(true);

    try {
      const response = await changePasswordApi(formData);
      if (response.data?.success) {
        setApiMessage({ type: "success", text: "✅ Password changed successfully. Please login again." });
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });

        // Clear session on success
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setApiMessage({ type: "error", text: response.data?.message || "❌ Failed to change password." });
      }
    } catch (err) {
      console.error("Error changing password:", err);
      const errMsg = err.response?.data?.message || "❌ Failed to change password.";
      setApiMessage({
        type: "error",
        text: errMsg.includes("Current password is incorrect") ? "❌ Current password is incorrect." : errMsg
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    !Object.values(errors).some((err) => err !== "");

  return (
    <section className="card p-6 md:p-8">
      <h3 className="card-title text-xl font-bold mb-2">Change Password</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Ensure your account security by choosing a password with at least 8 characters containing upper/lower letters, a digit, and a special character.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleFieldChange}
            placeholder="••••••••"
            className={`w-full rounded-2xl border bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300 ${
              errors.currentPassword
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-slate-800 focus:border-[#F37021]"
            }`}
            required
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleFieldChange}
            placeholder="••••••••"
            className={`w-full rounded-2xl border bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300 ${
              errors.newPassword
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-slate-800 focus:border-[#F37021]"
            }`}
            required
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {errors.newPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleFieldChange}
            placeholder="••••••••"
            className={`w-full rounded-2xl border bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300 ${
              errors.confirmPassword
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-slate-800 focus:border-[#F37021]"
            }`}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {errors.confirmPassword}
            </p>
          )}
        </div>

        {apiMessage.text && (
          <div
            className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border ${
              apiMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
            }`}
          >
            <p>{apiMessage.text}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !isFormValid}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
        >
          {saving ? "Changing..." : "Change Password"}
        </button>
      </form>
    </section>
  );
};

export default ChangePassword;
