import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Check, X } from "lucide-react";
import { COLORS, inputStyle } from "../constants/theme";
import { formatMoney, pad } from "../lib/format";
import { useAuth } from "../context/AuthContext";

export default function ProductsPage({ products, onAdd, onEdit, onDelete }) {
  const { has } = useAuth();
  const canCreate = has("products.create");
  const canEdit = has("products.edit");
  const canDelete = has("products.delete");
  const canManage = canCreate || canEdit || canDelete;

  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [products, search]);

  async function handleDelete(id) {
    await onDelete(id);
    setDeleteConfirmId(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
            CATALOGUE
          </div>
          <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            Products
          </h2>
        </div>
        {canCreate && (
          <button
            className="lg-btn"
            onClick={onAdd}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 13.5, fontWeight: 600 }}
          >
            <Plus size={16} /> Add product
          </button>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 320 }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: COLORS.inkMuted }} />
        <input
          className="lg-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category, or ID"
          style={{ ...inputStyle, paddingLeft: 32 }}
        />
      </div>

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: canManage ? "70px 1.6fr 1fr 90px 100px 100px 60px" : "70px 1.6fr 1fr 90px 100px 100px",
            padding: "11px 16px",
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.inkMuted,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            borderBottom: `1px solid ${COLORS.rule}`,
          }}
        >
          <div>ID</div>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Qty</div>
          <div>Amount</div>
          {canManage && <div></div>}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: COLORS.inkMuted, fontSize: 13.5 }}>
            {products.length === 0 ? "No products yet. Add your first one to start billing." : "No products match that search."}
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="lg-row"
              style={{ display: "grid", gridTemplateColumns: canManage ? "70px 1.6fr 1fr 90px 100px 100px 60px" : "70px 1.6fr 1fr 90px 100px 100px", padding: "12px 16px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${COLORS.ruleLight}` }}
            >
              <div className="lg-mono" style={{ color: COLORS.inkMuted }}>
                P-{pad(p.id, 3)}
              </div>
              <div style={{ fontWeight: 500 }}>{p.name}</div>
              <div style={{ color: COLORS.inkMuted }}>{p.category}</div>
              <div className="lg-mono">{formatMoney(p.price)}</div>
              <div className="lg-mono">
                {p.qty === 0 ? (
                  <span style={{ color: COLORS.red, fontWeight: 600 }}>0 {p.unit}</span>
                ) : p.qty < 5 ? (
                  <span style={{ color: COLORS.amber, fontWeight: 600 }}>
                    {p.qty} {p.unit}
                  </span>
                ) : (
                  `${p.qty} ${p.unit}`
                )}
              </div>
              <div className="lg-mono" style={{ fontWeight: 600 }}>
                {formatMoney(Number(p.price) * p.qty)}
              </div>
              {canManage && (
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  {deleteConfirmId === p.id ? (
                    <>
                      <button className="lg-btn" onClick={() => handleDelete(p.id)} title="Confirm delete" style={{ background: COLORS.redLight, color: COLORS.red, padding: 5, borderRadius: 6 }}>
                        <Check size={13} />
                      </button>
                      <button className="lg-btn" onClick={() => setDeleteConfirmId(null)} title="Cancel" style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      {canEdit && (
                        <button className="lg-btn" onClick={() => onEdit(p)} title="Edit" style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                          <Pencil size={13} />
                        </button>
                      )}
                      {canDelete && (
                        <button className="lg-btn" onClick={() => setDeleteConfirmId(p.id)} title="Delete" style={{ background: "transparent", color: COLORS.inkMuted, padding: 5, borderRadius: 6 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
