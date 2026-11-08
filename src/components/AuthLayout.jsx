import { COLORS } from "../constants/theme";
import { useSettings } from "../context/SettingsContext";

export default function AuthLayout({ title, subtitle, children }) {
  const { settings, logoSrc } = useSettings();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.paper,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 32, width: 340, border: `1px solid ${COLORS.rule}` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, gap: 10 }}>
          {logoSrc ? (
            <img src={logoSrc} alt={settings.companyName} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8 }} />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1.5px solid ${COLORS.amber}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-6deg)",
              }}
            >
              <span className="lg-display" style={{ fontSize: 17, fontWeight: 700, color: COLORS.amber }}>
                {settings.companyName?.charAt(0) || "L"}
              </span>
            </div>
          )}
          <h1 className="lg-display" style={{ fontSize: 21, fontWeight: 600, margin: 0, textAlign: "center" }}>
            {title || settings.companyName}
          </h1>
          <div className="lg-mono" style={{ fontSize: 11, color: COLORS.inkMuted, letterSpacing: 0.5, textAlign: "center" }}>
            {subtitle}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
