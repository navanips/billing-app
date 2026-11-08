import { X } from "lucide-react";
import { COLORS } from "../constants/theme";

export default function ConnectionError({ message, onRetry }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 400,
        gap: 14,
        padding: 32,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        background: COLORS.paper,
        borderRadius: 12,
        border: `1px solid ${COLORS.rule}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: COLORS.redLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={20} color={COLORS.red} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.ink }}>Couldn't connect to the backend</div>
      <div style={{ fontSize: 13.5, color: COLORS.inkMuted, maxWidth: 380 }}>{message}</div>
      <button
        className="lg-btn"
        onClick={onRetry}
        style={{ padding: "8px 18px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 13.5, fontWeight: 600 }}
      >
        Retry connection
      </button>
    </div>
  );
}
