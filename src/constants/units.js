// Keep this in sync with VALID_UNITS in backend/src/validation/productSchema.ts —
// the backend is the source of truth and will reject anything not in this list.
export const UNIT_OPTIONS = ["pcs", "kg", "g", "litre", "ml", "box", "dozen", "pack", "meter"];
