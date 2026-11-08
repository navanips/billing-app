import { X } from "lucide-react";
import { COLORS } from "../constants/theme";

export default function ActionErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 8,
        background: COLORS.redLight,
        color: COLORS.red,
        fontSize: 13,
        marginBottom: 18,
      }}
    >
      <span>{message}</span>
      <button className="lg-btn" onClick={onDismiss} style={{ background: "transparent", color: COLORS.red, padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  );
}
