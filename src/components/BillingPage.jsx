import { useMemo, useState } from "react";
import { Search, Trash2, Receipt } from "lucide-react";
import { COLORS, inputStyle } from "../constants/theme";
import { formatMoney } from "../lib/format";
import FieldLabel from "./FieldLabel";
import BillCard from "./BillCard";

export default function BillingPage({ products, bills, onGenerateBill }) {
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const pickerResults = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return products
      .filter((p) => p.qty > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 8);
  }, [products, pickerSearch]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.qty) return prev;
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price), unit: product.unit, qty: 1, stock: product.qty }];
    });
    setPickerSearch("");
    setPickerOpen(false);
  }

  function updateCartQty(productId, qty) {
    const stock = products.find((p) => p.id === productId)?.qty ?? 0;
    const clamped = Math.max(1, Math.min(qty, stock || 1));
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: clamped } : i)));
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);

  async function handleGenerateBill() {
    if (cart.length === 0) return;
    setCartError(null);
    setGenerating(true);
    try {
      await onGenerateBill({
        customerName: customerName.trim() || undefined,
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      setCart([]);
      setCustomerName("");
    } catch (err) {
      if (err.status === 409 && err.body?.error?.items) {
        const details = err.body.error.items
          .map((i) => {
            const prod = products.find((p) => p.id === i.productId);
            return `${prod ? prod.name : "item"} (wanted ${i.requested}, only ${i.available} left)`;
          })
          .join("; ");
        setCartError(`Not enough stock — ${details}.`);
      } else if (err.status === 400 && err.body?.error?.fields) {
        setCartError(Object.values(err.body.error.fields).join(" "));
      } else {
        setCartError(err.message === "Failed to fetch" ? "Can't reach the backend API. Is it running?" : err.message);
      }
    } finally {
      setGenerating(false);
    }
  }

  const filteredBills = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => b.customerName.toLowerCase().includes(q) || b.billNumber.toLowerCase().includes(q));
  }, [bills, historySearch]);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
          NEW ENTRY
        </div>
        <h2 className="lg-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Billing
        </h2>
      </div>

      <div style={{ background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.rule}`, padding: 20, marginBottom: 32 }}>
        <FieldLabel>Customer name</FieldLabel>
        <input
          className="lg-input"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Walk-in Customer"
          style={{ ...inputStyle, maxWidth: 320 }}
        />

        <FieldLabel>Add product to bill</FieldLabel>
        <div style={{ position: "relative", maxWidth: 380 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: COLORS.inkMuted }} />
          <input
            className="lg-input"
            value={pickerSearch}
            onChange={(e) => {
              setPickerSearch(e.target.value);
              setPickerOpen(true);
            }}
            onFocus={() => setPickerOpen(true)}
            placeholder="Search products in stock…"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
          {pickerOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: `1px solid ${COLORS.rule}`,
                borderRadius: 8,
                boxShadow: "0 8px 20px rgba(28,43,57,0.12)",
                zIndex: 10,
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {pickerResults.length === 0 ? (
                <div style={{ padding: "12px 14px", fontSize: 13, color: COLORS.inkMuted }}>No in-stock products found.</div>
              ) : (
                pickerResults.map((p) => (
                  <button
                    key={p.id}
                    className="lg-btn lg-row"
                    onClick={() => addToCart(p)}
                    style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px 14px", background: "transparent", textAlign: "left", fontSize: 13.5 }}
                  >
                    <span>
                      {p.name} <span style={{ color: COLORS.inkMuted, fontSize: 12 }}>· {p.category}</span>
                    </span>
                    <span className="lg-mono" style={{ color: COLORS.inkMuted }}>
                      {formatMoney(p.price)} · {p.qty} {p.unit} left
                    </span>
                  </button>
                ))
              )}
              <button className="lg-btn" onClick={() => setPickerOpen(false)} style={{ width: "100%", padding: "8px", background: COLORS.paper, fontSize: 12, color: COLORS.inkMuted, textAlign: "center" }}>
                Close
              </button>
            </div>
          )}
        </div>

        {/* Cart */}
        <div style={{ marginTop: 20 }}>
          {cart.length === 0 ? (
            <div style={{ padding: "22px 0", textAlign: "center", color: COLORS.inkMuted, fontSize: 13.5, border: `1px dashed ${COLORS.rule}`, borderRadius: 8 }}>
              Cart is empty — search above to add products.
            </div>
          ) : (
            <div style={{ border: `1px solid ${COLORS.ruleLight}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 100px 100px 40px", padding: "9px 14px", fontSize: 11, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.4, background: COLORS.paper }}>
                <div>Item</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Amount</div>
                <div></div>
              </div>
              {cart.map((i) => (
                <div key={i.productId} style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 100px 100px 40px", padding: "10px 14px", fontSize: 13.5, alignItems: "center", borderTop: `1px solid ${COLORS.ruleLight}` }}>
                  <div>{i.name}</div>
                  <div className="lg-mono">{formatMoney(i.price)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      className="lg-input lg-mono"
                      type="number"
                      min="1"
                      max={i.stock}
                      value={i.qty}
                      onChange={(e) => updateCartQty(i.productId, parseInt(e.target.value) || 1)}
                      style={{ ...inputStyle, padding: "5px 8px", width: 55 }}
                    />
                    <span style={{ fontSize: 12, color: COLORS.inkMuted }}>{i.unit}</span>
                  </div>
                  <div className="lg-mono" style={{ fontWeight: 600 }}>
                    {formatMoney(i.price * i.qty)}
                  </div>
                  <button className="lg-btn" onClick={() => removeFromCart(i.productId)} style={{ background: "transparent", color: COLORS.red, padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: COLORS.tealLight, borderTop: `1px solid ${COLORS.rule}` }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Total</span>
                <span className="lg-mono" style={{ fontWeight: 700, fontSize: 18, color: COLORS.teal }}>
                  {formatMoney(cartTotal)}
                </span>
              </div>
            </div>
          )}

          {cartError && (
            <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: 7, background: COLORS.redLight, color: COLORS.red, fontSize: 12.5 }}>
              {cartError}
            </div>
          )}

          <button
            className="lg-btn"
            disabled={cart.length === 0 || generating}
            onClick={handleGenerateBill}
            style={{ marginTop: 14, padding: "10px 20px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
          >
            <Receipt size={15} /> {generating ? "Generating…" : "Generate bill"}
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="lg-mono" style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
              ARCHIVE
            </div>
            <h3 className="lg-display" style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>
              Bill history
            </h3>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 9.5, color: COLORS.inkMuted }} />
            <input
              className="lg-input"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search customer or bill no."
              style={{ ...inputStyle, paddingLeft: 30, width: 220, padding: "7px 10px 7px 30px", fontSize: 13 }}
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: COLORS.inkMuted, fontSize: 13.5, border: `1px dashed ${COLORS.rule}`, borderRadius: 8 }}>
            {bills.length === 0 ? "No bills recorded yet. Generate your first bill above." : "No bills match that search."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredBills.map((b) => (
              <BillCard key={b.id} bill={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
