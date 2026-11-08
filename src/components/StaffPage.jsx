import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { ROLE_OPTIONS, ROLE_LABELS } from "../constants/roles";
import { apiRequest, isNetworkError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

const emptyForm = { name: "", email: "", password: "", role: "STAFF" };

export default function StaffPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const body = await apiRequest("/users");
      setStaff(body.data);
    } catch (err) {
      setLoadError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(u) {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setErrors({});
    setShowForm(true);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrors({});
    try {
      if (editingUser) {
        const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role };
        if (form.password) payload.password = form.password;
        const body = await apiRequest(`/users/${editingUser.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setStaff((prev) => prev.map((u) => (u.id === editingUser.id ? body.data : u)));
      } else {
        const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role };
        const body = await apiRequest("/users", { method: "POST", body: JSON.stringify(payload) });
        setStaff((prev) => [...prev, body.data]);
      }
      setShowForm(false);
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else if (err.status === 409) {
        setErrors({ email: err.body?.error?.message || "An account with this email already exists." });
      } else {
        setErrors({ form: isNetworkError(err) ? "Can't reach the backend API." : err.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      setStaff((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setActionError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    } finally {
      setDeleteConfirmId(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
            TEAM
          </div>
          <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            Staff
          </h2>
        </div>
        <button
          className="lg-btn"
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 13.5, fontWeight: 600 }}
        >
          <Plus size={16} /> Add staff
        </button>
      </div>

      {actionError && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: COLORS.redLight, color: COLORS.red, fontSize: 13, marginBottom: 16 }}>
          {actionError}
        </div>
      )}

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 140px 60px", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${COLORS.rule}` }}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div></div>
        </div>

        {loading ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: COLORS.inkMuted, fontSize: 13.5 }}>Loading…</div>
        ) : loadError ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: COLORS.red, fontSize: 13.5 }}>{loadError}</div>
        ) : (
          staff.map((u) => (
            <div key={u.id} className="lg-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 140px 60px", padding: "12px 16px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${COLORS.ruleLight}` }}>
              <div style={{ fontWeight: 500 }}>
                {u.name} {u.id === currentUser.id && <span style={{ color: COLORS.inkMuted, fontSize: 12 }}>(you)</span>}
              </div>
              <div style={{ color: COLORS.inkMuted }}>{u.email}</div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: COLORS.tealLight, color: COLORS.teal }}>
                  {ROLE_LABELS[u.role]}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {deleteConfirmId === u.id ? (
                  <>
                    <button className="lg-btn" onClick={() => handleDelete(u.id)} style={{ background: COLORS.redLight, color: COLORS.red, padding: 5, borderRadius: 6 }}>
                      <Check size={13} />
                    </button>
                    <button className="lg-btn" onClick={() => setDeleteConfirmId(null)} style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="lg-btn" onClick={() => openEdit(u)} style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                      <Pencil size={13} />
                    </button>
                    {u.id !== currentUser.id && (
                      <button className="lg-btn" onClick={() => setDeleteConfirmId(u.id)} style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,43,57,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            style={{ background: COLORS.card, borderRadius: 12, padding: 24, width: 340, border: `1px solid ${COLORS.rule}` }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 className="lg-display" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                {editingUser ? "Edit staff" : "Add staff"}
              </h3>
              <button type="button" className="lg-btn" onClick={() => setShowForm(false)} style={{ background: "none", padding: 4, color: COLORS.inkMuted }}>
                <X size={18} />
              </button>
            </div>

            {errors.form && <FieldError>{errors.form}</FieldError>}

            <FieldLabel>Name</FieldLabel>
            <input className="lg-input" autoFocus value={form.name} onChange={(e) => updateField("name", e.target.value)} style={errors.name ? inputErrorStyle : inputStyle} />
            {errors.name && <FieldError>{errors.name}</FieldError>}

            <FieldLabel>Email</FieldLabel>
            <input className="lg-input" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} style={errors.email ? inputErrorStyle : inputStyle} />
            {errors.email && <FieldError>{errors.email}</FieldError>}

            <FieldLabel>{editingUser ? "New password (leave blank to keep current)" : "Password"}</FieldLabel>
            <input className="lg-input" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} style={errors.password ? inputErrorStyle : inputStyle} />
            {errors.password && <FieldError>{errors.password}</FieldError>}

            <FieldLabel>Role</FieldLabel>
            <select className="lg-select" value={form.role} onChange={(e) => updateField("role", e.target.value)} style={inputStyle}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="lg-btn"
              disabled={submitting}
              onClick={handleSubmit}
              style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
            >
              {submitting ? "Saving…" : editingUser ? "Save changes" : "Add staff member"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
