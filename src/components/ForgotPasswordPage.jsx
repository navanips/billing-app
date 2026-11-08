import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { apiRequest, isNetworkError } from "../lib/api";
import AuthLayout from "./AuthLayout";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
      setSent(true);
    } catch (err) {
      setError(isNetworkError(err) ? "Can't reach the backend API. Is it running?" : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout subtitle="CHECK YOUR EMAIL">
        <p style={{ fontSize: 13.5, color: COLORS.ink, lineHeight: 1.6, textAlign: "center" }}>
          If an account exists for <strong>{email.trim()}</strong>, a reset link has been sent.
        </p>
        <p style={{ fontSize: 12, color: COLORS.inkMuted, lineHeight: 1.6, textAlign: "center", marginTop: 8 }}>
          Email sending isn't configured yet in this dev setup — check the <strong>backend server console</strong> for the reset link.
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

  return (
    <AuthLayout subtitle="RESET YOUR PASSWORD">
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
        <p style={{ fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 4, lineHeight: 1.5 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        {error && <FieldError>{error}</FieldError>}

        <FieldLabel>Email</FieldLabel>
        <input
          className="lg-input"
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@shop.local"
          style={error ? inputErrorStyle : inputStyle}
        />

        <button
          type="button"
          className="lg-btn"
          disabled={submitting}
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: COLORS.inkMuted }}>
          <button type="button" className="lg-btn" onClick={() => onNavigate("login")} style={{ background: "none", padding: 0, color: COLORS.teal, fontWeight: 600 }}>
            Back to sign in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
