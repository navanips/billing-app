import { useEffect, useState } from "react";
import { COLORS } from "./constants/theme";
import { apiRequest, isNetworkError, API_BASE } from "./lib/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Sidebar from "./components/Sidebar";
import ConnectionError from "./components/ConnectionError";
import ActionErrorBanner from "./components/ActionErrorBanner";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ProductsPage from "./components/ProductsPage";
import ProductFormModal from "./components/ProductFormModal";
import BillingPage from "./components/BillingPage";
import StaffPage from "./components/StaffPage";
import PermissionsPage from "./components/PermissionsPage";
import SettingsPage from "./components/SettingsPage";
import ProfilePage from "./components/ProfilePage";
import ChangePasswordPage from "./components/ChangePasswordPage";

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SettingsProvider>
  );
}

function Root() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [resetToken, setResetToken] = useState(null);

  // A password-reset link looks like /?resetToken=xxx — detect it once on
  // load (works with plain static hosting, no SPA-routing config needed)
  // and strip it from the URL so refreshing doesn't resubmit it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token) {
      setResetToken(token);
      setAuthView("reset");
      params.delete("resetToken");
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: COLORS.inkMuted, fontFamily: "Inter, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    if (authView === "register") return <RegisterPage onNavigate={setAuthView} />;
    if (authView === "forgot") return <ForgotPasswordPage onNavigate={setAuthView} />;
    if (authView === "reset") return <ResetPasswordPage token={resetToken} onNavigate={setAuthView} />;
    return <LoginPage onNavigate={setAuthView} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { has, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadAll() {
    setInitError(null);
    try {
      const [productsBody, billsBody] = await Promise.all([
        apiRequest("/products?limit=200"),
        apiRequest("/bills?limit=200"),
      ]);
      setProducts(productsBody.data);
      setBills(billsBody.data);
      setReady(true);
    } catch (err) {
      setInitError(isNetworkError(err) ? `Can't reach the backend API. Make sure it's running (npm run dev) at ${API_BASE}` : err.message);
      setReady(true);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // If the active tab becomes inaccessible (e.g. Master revoked a
  // permission mid-session), fall back to Products rather than showing
  // a blank/broken page.
  useEffect(() => {
    const allowed = {
      products: true,
      billing: true,
      staff: has("staff.manage"),
      permissions: user.role === "MASTER",
      settings: has("settings.manage"),
      profile: true,
      "change-password": true,
    };
    if (!allowed[activeTab]) setActiveTab("products");
  }, [activeTab, has, user.role]);

  function openAddProduct() {
    setEditingProduct(null);
    setShowProductForm(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setShowProductForm(true);
  }

  async function submitProduct(payload, currentId) {
    if (currentId) {
      const body = await apiRequest(`/products/${currentId}`, { method: "PUT", body: JSON.stringify(payload) });
      setProducts((prev) => prev.map((p) => (p.id === currentId ? body.data : p)));
    } else {
      const body = await apiRequest("/products", { method: "POST", body: JSON.stringify(payload) });
      setProducts((prev) => [...prev, body.data]);
    }
  }

  async function deleteProduct(id) {
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setActionError(isNetworkError(err) ? "Can't reach the backend API." : err.message);
    }
  }

  async function generateBill(payload) {
    const body = await apiRequest("/bills", { method: "POST", body: JSON.stringify(payload) });
    setBills((prev) => [body.data, ...prev]);
    const productsBody = await apiRequest("/products?limit=200");
    setProducts(productsBody.data);
  }

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: COLORS.inkMuted, fontFamily: "Inter, sans-serif" }}>
        Connecting to the ledger…
      </div>
    );
  }

  if (initError) {
    return <ConnectionError message={initError} onRetry={loadAll} />;
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: COLORS.ink,
        background: COLORS.paper,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, padding: "28px 32px", minWidth: 0, overflowY: "auto" }}>
        <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

        {activeTab === "products" && (
          <ProductsPage products={products} onAdd={openAddProduct} onEdit={openEditProduct} onDelete={deleteProduct} />
        )}
        {activeTab === "billing" && <BillingPage products={products} bills={bills} onGenerateBill={generateBill} />}
        {activeTab === "staff" && <StaffPage />}
        {activeTab === "permissions" && <PermissionsPage />}
        {activeTab === "settings" && <SettingsPage />}
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "change-password" && <ChangePasswordPage />}
      </div>

      <ProductFormModal
        open={showProductForm}
        editingProduct={editingProduct}
        products={products}
        onClose={() => setShowProductForm(false)}
        onSubmit={submitProduct}
      />
    </div>
  );
}
