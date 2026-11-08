import { COLORS } from "../constants/theme";

export default function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11.5,
        fontWeight: 600,
        color: COLORS.inkMuted,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 6,
        marginTop: 12,
      }}
    >
      {children}
    </label>
  );
}
