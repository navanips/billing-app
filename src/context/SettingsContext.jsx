import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, API_BASE } from "../lib/api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ companyName: "My Shop", logoUrl: null });
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    try {
      const body = await apiRequest("/settings");
      setSettings(body.data);
    } catch (e) {
      // Non-fatal — fall back to the default name/no logo.
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Uploaded logos are served from the backend origin (not the frontend
  // dev server), so build a full URL from the API base.
  const logoSrc = settings.logoUrl ? `${API_BASE.replace(/\/api\/v1$/, "")}${settings.logoUrl}` : null;

  return (
    <SettingsContext.Provider value={{ settings, loaded, logoSrc, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
