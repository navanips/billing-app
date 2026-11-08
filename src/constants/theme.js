// Ledger / receipt-inspired palette. Kept in one place so every
// component references the same values — update here, not per-file.
export const COLORS = {
  navy: "#1C2B39",
  navyLight: "#2A3D4F",
  paper: "#EDEAE0",
  card: "#FFFDF7",
  rule: "#C9C2AE",
  ruleLight: "#DDD8C8",
  teal: "#2F6F5E",
  tealLight: "#E4EEE9",
  amber: "#C97A2B",
  amberLight: "#F5E7D5",
  red: "#A6433D",
  redLight: "#F3E1DF",
  ink: "#1C2B39",
  inkMuted: "#6B7280",
};

export const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${COLORS.rule}`,
  background: "#FFFFFF",
  fontSize: 14,
  color: COLORS.ink,
  boxSizing: "border-box",
};

export const inputErrorStyle = {
  ...inputStyle,
  border: `1.5px solid ${COLORS.red}`,
  background: COLORS.redLight,
};
