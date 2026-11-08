import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, setUnauthorizedHandler } from "../lib/api";
import { getToken, setToken, clearToken } from "../lib/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiRequest("/auth/me")
      .then((body) => setUser(body.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const body = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(body.data.token);
    setUser(body.data.user);
  }

  async function register(name, email, password) {
    const body = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(body.data.token);
    setUser(body.data.user);
  }

  async function updateProfile(payload) {
    const body = await apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(payload) });
    setUser(body.data);
    return body.data;
  }

  async function changePassword(payload) {
    await apiRequest("/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
  }

  // has(permissionKey) — the single check point components use to decide
  // whether to show/enable something. MASTER's permissions array already
  // contains every key (computed server-side), so this needs no special case.
  function has(permissionKey) {
    return !!user?.permissions?.includes(permissionKey);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, has }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
