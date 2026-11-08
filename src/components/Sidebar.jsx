import { useState } from "react";
import { Package, Receipt, Users, ShieldCheck, Settings as SettingsIcon, User, KeyRound, LogOut, ChevronUp } from "lucide-react";
import { COLORS } from "../constants/theme";
import { ROLE_LABELS } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const NAV_ITEMS = [
  { tab: "products", label: "Products", icon: Package },
  { tab: "billing", label: "Billing", icon: Receipt },
  { tab: "staff", label: "Staff", icon: Users, permission: "staff.manage" },
  { tab: "permissions", label: "Permissions", icon: ShieldCheck, masterOnly: true },
  { tab: "settings", label: "Settings", icon: SettingsIcon, permission: "settings.manage" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, has, logout } = useAuth();
  const { settings, logoSrc } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.masterOnly) return user.role === "MASTER";
    if (item.permission) return has(item.permission);
    return true;
  });

  return (
    <div
      className="lg-sidebar"
      style={{
        width: 200,
        background: COLORS.navy,
        color: "#EDEAE0",
        padding: "24px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 24px 8px" }}>
        {logoSrc ? (
          <img src={logoSrc} alt={settings.companyName} style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
        ) : (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1.5px solid #C97A2B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-6deg)",
              flexShrink: 0,
            }}
          >
            <span className="lg-display" style={{ fontSize: 14, fontWeight: 700, color: "#C97A2B" }}>
              {settings.companyName?.charAt(0) || "L"}
            </span>
          </div>
        )}
        <span className="lg-display lg-label" style={{ fontSize: 17, fontWeight: 600, letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {settings.companyName}
        </span>
      </div>

      {visibleItems.map(({ tab, label, icon: Icon }) => (
        <button
          key={tab}
          className="lg-btn lg-navitem"
          onClick={() => setActiveTab(tab)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: activeTab === tab ? COLORS.navyLight : "transparent",
            color: activeTab === tab ? "#fff" : "#B9C2CA",
            fontSize: 14,
            fontWeight: 500,
            textAlign: "left",
          }}
        >
          <Icon size={17} />
          <span className="lg-label">{label}</span>
        </button>
      ))}

      <div style={{ marginTop: "auto", position: "relative" }}>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              border: `1px solid ${COLORS.rule}`,
            }}
          >
            <button
              className="lg-btn lg-row"
              onClick={() => { setActiveTab("profile"); setMenuOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", background: "transparent", color: COLORS.ink, fontSize: 13, textAlign: "left" }}
            >
              <User size={14} /> Profile
            </button>
            <button
              className="lg-btn lg-row"
              onClick={() => { setActiveTab("change-password"); setMenuOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", background: "transparent", color: COLORS.ink, fontSize: 13, textAlign: "left" }}
            >
              <KeyRound size={14} /> Change password
            </button>
            <button
              className="lg-btn lg-row"
              onClick={logout}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", background: "transparent", color: COLORS.red, fontSize: 13, textAlign: "left", borderTop: `1px solid ${COLORS.ruleLight}` }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}

        <button
          className="lg-btn"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 8,
            background: menuOpen ? COLORS.navyLight : "transparent",
            color: "#fff",
          }}
        >
          <span style={{ textAlign: "left", overflow: "hidden" }} className="lg-label">
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 10.5, color: "#9AA7B0" }}>{ROLE_LABELS[user.role]}</div>
          </span>
          <ChevronUp size={14} className="lg-label" style={{ transform: menuOpen ? "none" : "rotate(180deg)", transition: "transform 0.15s", flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );
}
