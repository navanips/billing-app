import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { COLORS, inputStyle, inputErrorStyle } from "../constants/theme";
import { UNIT_OPTIONS } from "../constants/units";
import { validateProductForm } from "../lib/validation";
import { isNetworkError } from "../lib/api";
import FieldLabel from "./FieldLabel";
import FieldError from "./FieldError";

const emptyForm = { name: "", category: "", unit: "pcs", price: "", qty: "" };

export default function ProductFormModal({ open, editingProduct, products, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset the form whenever the modal opens (either fresh or for editing)
  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        category: editingProduct.category,
        unit: editingProduct.unit || "pcs",
        price: String(editingProduct.price),
        qty: String(editingProduct.qty),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editingProduct]);

  if (!open) return null;

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleClose() {
    setErrors({});
    onClose();
  }

  async function handleSubmit() {
    const currentId = editingProduct?.id ?? null;
    const clientErrors = validateProductForm(form, products, currentId);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit,
      price: parseFloat(form.price),
      qty: parseInt(form.qty, 10),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload, currentId);
      handleClose();
    } catch (err) {
      if (err.status === 400 && err.body?.error?.fields) {
        setErrors(err.body.error.fields);
      } else if (err.status === 409) {
        setErrors({ name: err.body?.error?.message || "A product with this name already exists." });
      } else {
        setErrors({ form: isNetworkError(err) ? "Can't reach the backend API. Is it running?" : err.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(28,43,57,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        style={{ background: COLORS.card, borderRadius: 12, padding: 24, width: 340, border: `1px solid ${COLORS.rule}` }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 className="lg-display" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            {editingProduct ? "Edit product" : "Add product"}
          </h3>
          <button type="button" className="lg-btn" onClick={handleClose} style={{ background: "none", padding: 4, color: COLORS.inkMuted }}>
            <X size={18} />
          </button>
        </div>

        {errors.form && <FieldError>{errors.form}</FieldError>}

        <FieldLabel>Product name</FieldLabel>
        <input
          className="lg-input"
          autoFocus
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. Wireless Mouse"
          style={errors.name ? inputErrorStyle : inputStyle}
          aria-invalid={!!errors.name}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}

        <FieldLabel>Category</FieldLabel>
        <input
          className="lg-input"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="e.g. Electronics"
          style={errors.category ? inputErrorStyle : inputStyle}
          aria-invalid={!!errors.category}
        />
        {errors.category && <FieldError>{errors.category}</FieldError>}

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Price (₹)</FieldLabel>
            <input
              className="lg-input lg-mono"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="0.00"
              style={errors.price ? inputErrorStyle : inputStyle}
              aria-invalid={!!errors.price}
            />
            {errors.price && <FieldError>{errors.price}</FieldError>}
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Measuring type</FieldLabel>
            <select
              className="lg-select"
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              style={errors.unit ? inputErrorStyle : inputStyle}
              aria-invalid={!!errors.unit}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {errors.unit && <FieldError>{errors.unit}</FieldError>}
          </div>
        </div>

        <FieldLabel>Stock qty</FieldLabel>
        <input
          className="lg-input lg-mono"
          type="number"
          min="0"
          step="1"
          value={form.qty}
          onChange={(e) => updateField("qty", e.target.value)}
          placeholder="0"
          style={{ ...(errors.qty ? inputErrorStyle : inputStyle), maxWidth: 140 }}
          aria-invalid={!!errors.qty}
        />
        {errors.qty && <FieldError>{errors.qty}</FieldError>}

        <button
          type="button"
          className="lg-btn"
          disabled={submitting}
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 8, background: COLORS.teal, color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {submitting ? "Saving…" : editingProduct ? "Save changes" : "Add to catalogue"}
        </button>
      </div>
    </div>
  );
}
