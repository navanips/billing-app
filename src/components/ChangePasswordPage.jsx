import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { isNetworkError } from "../lib/api";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setErrors({});
    try {
      await changePassword(form);
      setForm(emptyForm);
      setSaved(true);
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else {
        setErrors({ form: isNetworkError(err) ? "Can't reach the backend API." : err.message });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
          ACCOUNT
        </div>
        <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Change password
        </h2>
      </div>

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, padding: 20, maxWidth: 380 }}>
        {errors.form && <FieldError>{errors.form}</FieldError>}

        <FieldLabel>Current password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          value={form.currentPassword}
          onChange={(e) => updateField("currentPassword", e.target.value)}
          style={errors.currentPassword ? inputErrorStyle : inputStyle}
        />
        {errors.currentPassword && <FieldError>{errors.currentPassword}</FieldError>}

        <FieldLabel>New password</FieldLabel>
        <input
          className="lg-input"
          type="password"
          value={form.newPassword}
          onChange={(e) => updateField("newPassword", e.target.value)}
          style={errors.newPassword ? inputErrorStyle : inputStyle}
        />
        {errors.newPassword && <FieldError>{errors.newPassword}</FieldError>}

        <FieldLabel>Confirm new password</FieldLabel>
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
          disabled={saving}
          onClick={handleSave}
          style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {saving ? "Saving…" : "Update password"}
        </button>
        {saved && <span style={{ marginLeft: 10, fontSize: 12.5, color: COLORS.teal }}>Password updated.</span>}
      </div>
    </div>
  );
}
