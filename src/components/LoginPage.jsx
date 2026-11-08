import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Can't reach the backend API. Is it running?" : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="SIGN IN TO CONTINUE">
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
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

        <FieldLabel>Password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={error ? inputErrorStyle : inputStyle}
        />

        <div style={{ textAlign: "right", marginTop: 8 }}>
          <button
            type="button"
            className="lg-btn"
            onClick={() => onNavigate("forgot")}
            style={{ background: "none", padding: 0, fontSize: 12.5, color: COLORS.teal, fontWeight: 600 }}
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="button"
          className="lg-btn"
          disabled={submitting}
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: COLORS.inkMuted }}>
          New here?{" "}
          <button type="button" className="lg-btn" onClick={() => onNavigate("register")} style={{ background: "none", padding: 0, color: COLORS.teal, fontWeight: 600 }}>
            Create an account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
