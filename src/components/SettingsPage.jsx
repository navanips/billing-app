import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { COLORS, inputStyle } from "../constants/theme";
import { apiRequest, apiUpload, isNetworkError } from "../lib/api";
import { useSettings } from "../context/SettingsContext";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

export default function SettingsPage() {
  const { settings, logoSrc, refresh } = useSettings();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleSaveName() {
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);
    try {
      await apiRequest("/settings", { method: "PUT", body: JSON.stringify({ companyName: companyName.trim() }) });
      await refresh();
      setNameSaved(true);
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields?.companyName) {
        setNameError(err.body.error.fields.companyName);
      } else {
        setNameError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
      }
    } finally {
      setSavingName(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      await apiUpload("/settings/logo", formData);
      await refresh();
    } catch (err) {
      setUploadError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
          BRANDING
        </div>
        <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Settings
        </h2>
      </div>

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, padding: 20, maxWidth: 420 }}>
        <FieldLabel>Company name</FieldLabel>
        <input className="lg-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
        {nameError && <FieldError>{nameError}</FieldError>}
        <button
          type="button"
          className="lg-btn"
          disabled={savingName || !companyName.trim()}
          onClick={handleSaveName}
          style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 13.5, fontWeight: 600 }}
        >
          {savingName ? "Saving…" : "Save name"}
        </button>
        {nameSaved && <span style={{ marginLeft: 10, fontSize: 12.5, color: COLORS.teal }}>Saved.</span>}

        <FieldLabel>Logo</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              border: `1px dashed ${COLORS.rule}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            {logoSrc ? <img src={logoSrc} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 11, color: COLORS.inkMuted }}>None</span>}
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="logo-upload" />
            <button
              type="button"
              className="lg-btn"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: COLORS.paper, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, fontSize: 13, fontWeight: 600 }}
            >
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload new logo"}
            </button>
            <div style={{ fontSize: 11.5, color: COLORS.inkMuted, marginTop: 6 }}>PNG or JPG, up to 2MB.</div>
            {uploadError && <FieldError>{uploadError}</FieldError>}
          </div>
        </div>
      </div>
    </div>
  );
}
