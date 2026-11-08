import { X } from "lucide-react";
import { COLORS } from "../constants/theme";

export default function FieldError({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 5,
        fontSize: 12,
        color: COLORS.red,
        fontWeight: 500,
      }}
    >
      <X size={12} style={{ flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}
