import * as React from "react";
import {
  authStore,
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
  type AuthState,
  type AuthUser,
} from "./auth-store";
import type { Permission, Role } from "./permissions";

interface AuthContextValue extends AuthState {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  hasRole: (r: Role) => boolean;
  hasAnyRole: (r: Role[]) => boolean;
  hasPermission: (p: Permission) => boolean;
  hasAllPermissions: (p: Permission[]) => boolean;
  hasAnyPermission: (p: Permission[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = React.useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState,
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: authStore.signIn,
      signOut: authStore.signOut,
      hasRole: (r) => hasRole(state.user, r),
      hasAnyRole: (r) => hasAnyRole(state.user, r),
      hasPermission: (p) => hasPermission(state.user, p),
      hasAllPermissions: (p) => hasAllPermissions(state.user, p),
      hasAnyPermission: (p) => hasAnyPermission(state.user, p),
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/**
 * Componente envoltorio para proteger fragmentos de UI (no rutas).
 * Para proteger rutas completas usar los guards de `src/core/guards/route-guards.ts`.
 */
export function PrivateRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  mode = "all",
  fallback = null,
}: {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
  mode?: "all" | "any";
  fallback?: React.ReactNode;
}) {
  const auth = useAuth();
  if (!auth.isAuthenticated) return <>{fallback}</>;
  if (requiredRoles.length && !auth.hasAnyRole(requiredRoles)) return <>{fallback}</>;
  if (requiredPermissions.length) {
    const ok =
      mode === "any"
        ? auth.hasAnyPermission(requiredPermissions)
        : auth.hasAllPermissions(requiredPermissions);
    if (!ok) return <>{fallback}</>;
  }
  return <>{children}</>;
}
