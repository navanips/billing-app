import { UNIT_OPTIONS } from "../constants/units";

// Mirrors productInputSchema on the backend so the same messages show up
// whether validation fails client-side (instant feedback) or server-side
// (source of truth — e.g. the uniqueness check needs a DB round trip).
export function validateProductForm(form, products, currentId) {
  const errors = {};
  const name = form.name.trim();
  const category = form.category.trim();
  const priceStr = String(form.price).trim();
  const qtyStr = String(form.qty).trim();
  const unit = (form.unit || "").trim().toLowerCase();

  if (!name) {
    errors.name = "Product name is required.";
  } else if (name.length < 2) {
    errors.name = "Product name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Product name must be under 60 characters.";
  } else {
    const dup = products.some(
      (p) => p.id !== currentId && p.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (dup) errors.name = "A product with this name already exists.";
  }

  if (category.length > 40) {
    errors.category = "Category must be under 40 characters.";
  }

  if (unit && !UNIT_OPTIONS.includes(unit)) {
    errors.unit = `Unit must be one of: ${UNIT_OPTIONS.join(", ")}.`;
  }

  if (priceStr === "") {
    errors.price = "Price is required.";
  } else if (isNaN(Number(priceStr))) {
    errors.price = "Price must be a number.";
  } else if (Number(priceStr) <= 0) {
    errors.price = "Price must be greater than 0.";
  } else if (Number(priceStr) > 10000000) {
    errors.price = "Price seems too high — check the value.";
  }

  if (qtyStr === "") {
    errors.qty = "Stock quantity is required.";
  } else if (!/^\d+$/.test(qtyStr)) {
    errors.qty = "Quantity must be a whole number, 0 or more.";
  } else if (Number(qtyStr) > 1000000) {
    errors.qty = "Quantity seems too high — check the value.";
  }

  return errors;
}
