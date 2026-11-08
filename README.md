# Billing App — Frontend

A Vite + React app for Products, Billing, Staff, Permissions, Settings, and
account management — talking to the backend API (see `../backend`).

## Setup

```bash
npm install
cp .env.example .env   # points at your backend; edit if it's not on :4000
npm run dev
```

Opens at `http://localhost:5173`. Make sure the backend is running and
seeded first (see `../backend/README.md`) — the seed script prints a
default Master login you can use immediately.

## File structure

```
src/
  main.jsx                    — React entry point
  App.jsx                     — providers, login gating, tab routing
  index.css                   — fonts + shared utility classes (ledger theme)
  context/
    AuthContext.jsx           — session state, login/logout, profile, password, has(permission)
    SettingsContext.jsx       — company branding (public, works pre-login)
  constants/
    theme.js, units.js, roles.js
  lib/
    api.js                    — fetch wrapper: auth header, 401 auto-logout, upload helper
    tokenStorage.js            — localStorage token get/set/clear
    format.js, validation.js
  components/
    Sidebar.jsx                 — dynamic branding, permission-gated nav, user menu
    AuthLayout.jsx                — shared branded card wrapper for all pre-login screens
    LoginPage.jsx                 — sign-in, with links to Register / Forgot password
    RegisterPage.jsx               — public signup (always creates a Staff account)
    ForgotPasswordPage.jsx          — request a reset link
    ResetPasswordPage.jsx            — consumes ?resetToken=... from the emailed/console link
    ConnectionError.jsx, ActionErrorBanner.jsx
    ProductsPage.jsx             — add/edit/delete hidden per permission
    ProductFormModal.jsx
    BillingPage.jsx, BillCard.jsx — bill history shows "Billed by" when visible
    StaffPage.jsx                 — manage staff accounts (needs staff.manage)
    PermissionsPage.jsx            — checkbox matrix (Master only)
    SettingsPage.jsx                — company name + logo upload
    ProfilePage.jsx, ChangePasswordPage.jsx
    FieldLabel.jsx / FieldError.jsx
```

## Roles & permissions

Every gated UI element checks `useAuth().has("permission.key")`, which
reads the `permissions` array the backend already computed and attached to
the logged-in user (see `AuthContext`). There's no role logic duplicated
on the frontend — it just reflects what the server already decided.

- **Master** — sees every nav item, always.
- **Branch Manager / Staff** — see "Staff", "Permissions", "Settings" only
  if granted; "Products" add/edit/delete buttons only appear if granted.
- **Bill history** — the backend already filters the list to "own bills
  only" unless `billing.view_all` is granted, so no client-side filtering
  is needed here either.

If Master revokes a permission while someone's mid-session on that page,
`App.jsx` redirects them back to Products on the next render rather than
leaving a broken/inaccessible tab open.

## Register & forgot password

- **Register** creates a Staff-role account only — there's no way to
  self-assign Branch Manager or Master through the UI or API.
- **Forgot password** hits the backend, which (for now) prints the reset
  link to its own console instead of emailing it — see
  `../backend/README.md` for where to wire up real email sending.
- The reset link looks like `http://localhost:5173/?resetToken=...` —
  `App.jsx` detects that query param on load, routes to
  `ResetPasswordPage`, and strips it from the URL bar.

## Build for production

```bash
npm run build
npm run preview
```
