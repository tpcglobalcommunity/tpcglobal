# TPC Global - Architecture Rules

## Header Rendering Rule (LOCKED)

### Rule Statement
Header components (AppHeader / PublicHeader / TopNav) are ONLY allowed to be rendered in Layout components. Page components under `src/pages/**` MUST NEVER render header components directly.

### Implementation Details

#### ✅ ALLOWED (Layout Components Only)
```tsx
// src/layouts/PublicLayout.tsx
export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />  // ✅ OK: Header in Layout
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
};
```

#### ❌ FORBIDDEN (Page Components)
```tsx
// src/pages/auth/LoginPage.tsx
const LoginPage = () => {
  return (
    <PremiumShell>
      <PublicHeader />  // ❌ VIOLATION: Header in Page
      <div>Login content</div>
    </PremiumShell>
  );
};
```

### Special Cases

#### Pages Without Header
If a page requires no header (e.g., login, onboarding, splash screen):
1. Create a dedicated layout WITHOUT header
2. Route the page through that layout
3. NEVER render header directly in the page component

```tsx
// src/layouts/AuthLayout.tsx (No Header)
export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen">
      <main>{children}</main>
    </div>
  );
};

// src/routes/index.tsx
<Route path="/:lang" element={<PublicLayout />}>  // Has header
  <Route path="home" element={<HomePage />} />
</Route>

<Route path="/auth" element={<AuthLayout />}>     // No header
  <Route path="login" element={<LoginPage />} />
</Route>
```

### Enforcement

#### Automated Guard
- Script: `scripts/check-no-page-header.js`
- Command: `npm run check:no-page-header`
- Hook: Runs automatically in `prebuild`

#### Violation Detection
The guard scans for these forbidden patterns in page files:
- `<AppHeader`
- `<PublicHeader`
- `<Header`
- `<TopNav`

#### Build Failure
Any violation will cause the build to fail with clear error message showing the offending file.

### Rationale

1. **Single Source of Truth**: Header rendering centralized in layouts
2. **Prevent Duplicates**: Eliminates double header issues
3. **Consistent UX**: Ensures uniform header behavior across pages
4. **Maintainability**: Changes to header only need to be made in one place
5. **Performance**: Avoids unnecessary component re-renders

### Migration Guide

When creating new pages:
1. ✅ Use existing layouts (PublicLayout, MemberLayout, etc.)
2. ✅ Create new layout if different header behavior needed
3. ❌ NEVER import or render header components in pages
4. ❌ NEVER wrap pages in components that render headers

### Exceptions

No exceptions allowed. This rule is locked and enforced by automated guard.

---

## Other Architecture Rules

*(This section can be expanded with additional rules as needed)*
