import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { apiRequest, isNetworkError } from "../lib/api";
import AuthLayout from "./AuthLayout";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

export default function ResetPasswordPage({ token, onNavigate }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setErrors({});
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match." });
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      setSuccess(true);
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else if (err.body?.error?.code === "INVALID_RESET_TOKEN") {
        setErrors({ form: err.body.error.message });
      } else {
        setErrors({ form: isNetworkError(err) ? "Can't reach the backend API. Is it running?" : err.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout subtitle="RESET LINK MISSING">
        <p style={{ fontSize: 13.5, color: COLORS.ink, lineHeight: 1.6, textAlign: "center" }}>
          This page needs a reset link — use the "Forgot your password?" link on the sign-in screen to request one.
        </p>
        <button
          type="button"
          className="lg-btn"
          onClick={() => onNavigate("login")}
          style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          Back to sign in
        </button>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout subtitle="PASSWORD UPDATED">
        <p style={{ fontSize: 13.5, color: COLORS.ink, lineHeight: 1.6, textAlign: "center" }}>
          Your password has been reset. Sign in with your new password.
        </p>
        <button
          type="button"
          className="lg-btn"
          onClick={() => onNavigate("login")}
          style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          Go to sign in
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitle="CHOOSE A NEW PASSWORD">
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
        {errors.form && <FieldError>{errors.form}</FieldError>}

        <FieldLabel>New password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          autoFocus
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={errors.newPassword ? inputErrorStyle : inputStyle}
        />
        {errors.newPassword && <FieldError>{errors.newPassword}</FieldError>}

        <FieldLabel>Confirm new password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={errors.confirmPassword ? inputErrorStyle : inputStyle}
        />
        {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}

        <button
          type="button"
          className="lg-btn"
          disabled={submitting}
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </div>
    </AuthLayout>
  );
}
