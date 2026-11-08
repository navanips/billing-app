import { useEffect, useState } from "react";
import { COLORS } from "../constants/theme";
import { ROLE_LABELS } from "../constants/roles";
import { apiRequest, isNetworkError } from "../lib/api";

const EDITABLE_ROLES = ["BRANCH_MANAGER", "STAFF"];

export default function PermissionsPage() {
  const [rows, setRows] = useState([]);
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const body = await apiRequest("/permissions");
      setRows(body.data);
      const flat = {};
      body.data.forEach((p) => EDITABLE_ROLES.forEach((role) => (flat[`${role}:${p.key}`] = p.roles[role])));
      setOriginal(flat);
    } catch (err) {
      setLoadError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(role, key) {
    setSaved(false);
    setRows((prev) => prev.map((p) => (p.key === key ? { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } : p)));
  }

  function hasChanges() {
    return rows.some((p) => EDITABLE_ROLES.some((role) => p.roles[role] !== original[`${role}:${p.key}`]));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const updates = [];
      rows.forEach((p) => {
        EDITABLE_ROLES.forEach((role) => {
          if (p.roles[role] !== original[`${role}:${p.key}`]) {
            updates.push({ role, permissionKey: p.key, granted: p.roles[role] });
          }
        });
      });
      if (updates.length === 0) return;
      await apiRequest("/permissions", { method: "PUT", body: JSON.stringify({ updates }) });
      const flat = { ...original };
      updates.forEach((u) => (flat[`${u.role}:${u.permissionKey}`] = u.granted));
      setOriginal(flat);
      setSaved(true);
    } catch (err) {
      setSaveError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    } finally {
      setSaving(false);
    }
  }

  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
          ACCESS CONTROL
        </div>
        <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Permissions
        </h2>
        <p style={{ fontSize: 13, color: COLORS.inkMuted, marginTop: 6, maxWidth: 480 }}>
          Master always has full access. Toggle what Branch Manager and Staff can do below.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: COLORS.inkMuted, fontSize: 13.5 }}>Loading…</div>
      ) : loadError ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: COLORS.red, fontSize: 13.5 }}>{loadError}</div>
      ) : (
        <>
          <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${COLORS.rule}` }}>
              <div>Permission</div>
              <div style={{ textAlign: "center" }}>{ROLE_LABELS.BRANCH_MANAGER}</div>
              <div style={{ textAlign: "center" }}>{ROLE_LABELS.STAFF}</div>
            </div>

            {groups.map((group) => (
              <div key={group}>
                <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 700, color: COLORS.amber, background: COLORS.amberLight, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {group}
                </div>
                {rows
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <div key={p.key} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px", padding: "12px 16px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${COLORS.ruleLight}` }}>
                      <div>{p.label}</div>
                      {EDITABLE_ROLES.map((role) => (
                        <div key={role} style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={p.roles[role]}
                            onChange={() => toggle(role, p.key)}
                            style={{ width: 17, height: 17, cursor: "pointer", accentColor: COLORS.teal }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {saveError && (
            <div style={{ marginTop: 14, padding: "9px 12px", borderRadius: 7, background: COLORS.redLight, color: COLORS.red, fontSize: 12.5 }}>{saveError}</div>
          )}
          {saved && !hasChanges() && (
            <div style={{ marginTop: 14, padding: "9px 12px", borderRadius: 7, background: COLORS.tealLight, color: COLORS.teal, fontSize: 12.5 }}>Saved.</div>
          )}

          <button
            className="lg-btn"
            disabled={!hasChanges() || saving}
            onClick={handleSave}
            style={{ marginTop: 14, padding: "10px 20px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </>
      )}
    </div>
  );
}
