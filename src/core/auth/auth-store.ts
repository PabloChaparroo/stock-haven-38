/**
 * Store de auth aislado del árbol de React.
 * Diseñado para ser legible tanto desde React (via AuthContext)
 * como desde guards isomorfos de TanStack Router (`beforeLoad`).
 *
 * En una integración real, reemplazar `mockUser` por la sesión
 * de Lovable Cloud / Supabase (supabase.auth.getUser + tabla user_roles).
 */
import { ROLE_PERMISSIONS, type Permission, type Role, ROLES } from "./permissions";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  /** Permisos efectivos: unión de los derivados de roles + overrides directos. */
  permissions: Permission[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// ----------------- Mock de usuario ------------------
// Cambiá el rol para probar guards (ADMIN ve todo; VENDEDOR no entra a compras).
const mockUser: AuthUser = {
  id: "u-001",
  email: "olivia@inventia.dev",
  name: "Olivia Martínez",
  roles: [ROLES.ADMIN],
  permissions: ROLE_PERMISSIONS.ADMIN,
};

let state: AuthState = {
  user: mockUser,
  isAuthenticated: true,
};

const listeners = new Set<() => void>();

export const authStore = {
  getState(): AuthState {
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  signIn(user: AuthUser) {
    state = { user, isAuthenticated: true };
    listeners.forEach((l) => l());
  },
  signOut() {
    state = { user: null, isAuthenticated: false };
    listeners.forEach((l) => l());
  },
};

// ----------------- Helpers puros ------------------
export function hasRole(user: AuthUser | null, role: Role): boolean {
  return !!user?.roles.includes(role);
}

export function hasAnyRole(user: AuthUser | null, roles: Role[]): boolean {
  if (!roles.length) return true;
  return !!user && roles.some((r) => user.roles.includes(r));
}

export function hasPermission(user: AuthUser | null, perm: Permission): boolean {
  return !!user?.permissions.includes(perm);
}

export function hasAllPermissions(user: AuthUser | null, perms: Permission[]): boolean {
  if (!perms.length) return true;
  return !!user && perms.every((p) => user.permissions.includes(p));
}

export function hasAnyPermission(user: AuthUser | null, perms: Permission[]): boolean {
  if (!perms.length) return true;
  return !!user && perms.some((p) => user.permissions.includes(p));
}
