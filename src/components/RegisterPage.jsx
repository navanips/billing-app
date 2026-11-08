import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" };

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit() {
    setErrors({});
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match." });
      return;
    }
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      // AuthContext sets the user on success, so App will switch to the
      // authenticated view automatically — nothing else to do here.
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else if (err.status === 409) {
        setErrors({ email: err.body?.error?.message || "An account with this email already exists." });
      } else if (err.status === 403) {
        setErrors({ form: err.body?.error?.message || "Registration is currently turned off." });
      } else {
        setErrors({ form: err.message === "Failed to fetch" ? "Can't reach the backend API. Is it running?" : err.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="CREATE YOUR ACCOUNT">
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
        {errors.form && <FieldError>{errors.form}</FieldError>}

        <FieldLabel>Name</FieldLabel>
        <input className="lg-input" autoFocus value={form.name} onChange={(e) => updateField("name", e.target.value)} style={errors.name ? inputErrorStyle : inputStyle} />
        {errors.name && <FieldError>{errors.name}</FieldError>}

        <FieldLabel>Email</FieldLabel>
        <input className="lg-input" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} style={errors.email ? inputErrorStyle : inputStyle} />
        {errors.email && <FieldError>{errors.email}</FieldError>}

        <FieldLabel>Password</FieldLabel>
        <input className="lg-input" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} style={errors.password ? inputErrorStyle : inputStyle} />
        {errors.password && <FieldError>{errors.password}</FieldError>}

        <FieldLabel>Confirm password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
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
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: COLORS.inkMuted }}>
          Already have an account?{" "}
          <button type="button" className="lg-btn" onClick={() => onNavigate("login")} style={{ background: "none", padding: 0, color: COLORS.teal, fontWeight: 600 }}>
            Sign in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
