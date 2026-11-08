import { getToken } from "./tokenStorage";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

let onUnauthorized = null;
// Registered by AuthContext so any 401 response (expired/invalid token)
// immediately drops the user back to the login screen, from anywhere.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // no JSON body (e.g. 204 No Content) — that's fine
  }

  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (!res.ok) {
    const err = new Error(body?.error?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// For multipart uploads (logo) — same auth/401 handling, no JSON content-type.
export async function apiUpload(path, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let body = null;
  try {
    body = await res.json();
  } catch (e) {}

  if (res.status === 401 && onUnauthorized) onUnauthorized();

  if (!res.ok) {
    const err = new Error(body?.error?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function isNetworkError(err) {
  return err.message === "Failed to fetch";
}
