import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { COLORS } from "../constants/theme";
import { formatMoney, formatDate } from "../lib/format";

export default function BillCard({ bill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.rule}`, borderRadius: 10, overflow: "hidden" }}>
      <button
        className="lg-btn"
        onClick={() => setExpanded((v) => !v)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", background: "transparent", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `1.5px solid ${COLORS.teal}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-8deg)",
              flexShrink: 0,
            }}
          >
            <Check size={13} color={COLORS.teal} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{bill.customerName}</div>
            <div className="lg-mono" style={{ fontSize: 11.5, color: COLORS.inkMuted, marginTop: 2 }}>
              {bill.billNumber} · {formatDate(bill.createdAt)}
              {bill.createdBy?.name && ` · Billed by ${bill.createdBy.name}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="lg-mono" style={{ fontWeight: 700, fontSize: 15 }}>
            {formatMoney(bill.total)}
          </span>
          {expanded ? <ChevronUp size={16} color={COLORS.inkMuted} /> : <ChevronDown size={16} color={COLORS.inkMuted} />}
        </div>
      </button>

      {expanded && (
        <div>
          <div className="lg-perforation" />
          <div className="lg-ruled" style={{ padding: "14px 20px 18px 20px" }}>
            {bill.items.map((i, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                <span className="lg-mono">
                  {i.name} × {i.qty} {i.unit}
                </span>
                <span className="lg-mono">{formatMoney(i.amount)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, paddingTop: 10, marginTop: 6, borderTop: `1px dashed ${COLORS.rule}` }}>
              <span>Total</span>
              <span className="lg-mono" style={{ color: COLORS.teal }}>
                {formatMoney(bill.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
