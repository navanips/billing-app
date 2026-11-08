import { useState } from "react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { ROLE_LABELS } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { isNetworkError } from "../lib/api";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setErrors({});
    setSaved(false);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setSaved(true);
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else if (err.status === 409) {
        setErrors({ email: err.body?.error?.message || "An account with this email already exists." });
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
          Profile
        </h2>
      </div>

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, padding: 20, maxWidth: 380 }}>
        {errors.form && <FieldError>{errors.form}</FieldError>}

        <FieldLabel>Role</FieldLabel>
        <div style={{ fontSize: 13.5, color: COLORS.inkMuted, padding: "9px 0" }}>{ROLE_LABELS[user.role]} (contact Master to change this)</div>

        <FieldLabel>Name</FieldLabel>
        <input className="lg-input" value={name} onChange={(e) => setName(e.target.value)} style={errors.name ? inputErrorStyle : inputStyle} />
        {errors.name && <FieldError>{errors.name}</FieldError>}

        <FieldLabel>Email</FieldLabel>
        <input className="lg-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={errors.email ? inputErrorStyle : inputStyle} />
        {errors.email && <FieldError>{errors.email}</FieldError>}

        <button
          type="button"
          className="lg-btn"
          disabled={saving}
          onClick={handleSave}
          style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span style={{ marginLeft: 10, fontSize: 12.5, color: COLORS.teal }}>Saved.</span>}
      </div>
    </div>
  );
}
