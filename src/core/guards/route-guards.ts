/**
 * Guards para `beforeLoad` de TanStack Router.
 * Equivalente al patrón `<PrivateRoute>` de React Router, pero a nivel router:
 * se ejecuta ANTES de montar el componente y evita el flash de contenido protegido.
 *
 * Uso típico en un archivo de ruta:
 *
 *   export const Route = createFileRoute("/ventas/")({
 *     beforeLoad: requirePermissions([PERMISSIONS.VENTA_CREATE]),
 *     component: POSPage,
 *   });
 */
import { redirect } from "@tanstack/react-router";
import { authStore, hasAllPermissions, hasAnyPermission, hasAnyRole } from "../auth/auth-store";
import type { Permission, Role } from "../auth/permissions";

interface GuardCtx {
  location: { href: string };
}

/** Exige sesión activa. Redirige a /auth con `redirect` para volver tras login. */
export function requireAuth() {
  return ({ location }: GuardCtx) => {
    const { isAuthenticated } = authStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
  };
}

/** Exige uno o más roles (cualquiera de la lista). */
export function requireRoles(roles: Role[]) {
  return ({ location }: GuardCtx) => {
    const { isAuthenticated, user } = authStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    if (!hasAnyRole(user, roles)) {
      throw redirect({ to: "/403", search: { from: location.href } });
    }
  };
}

/**
 * Exige permisos específicos.
 * @param mode "all" (por defecto) = debe tenerlos todos. "any" = al menos uno.
 */
export function requirePermissions(perms: Permission[], mode: "all" | "any" = "all") {
  return ({ location }: GuardCtx) => {
    const { isAuthenticated, user } = authStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    const ok = mode === "any" ? hasAnyPermission(user, perms) : hasAllPermissions(user, perms);
    if (!ok) {
      throw redirect({ to: "/403", search: { from: location.href } });
    }
  };
}

/**
 * Compone múltiples guards. Útil cuando una ruta requiere rol Y permisos.
 *
 *   beforeLoad: composeGuards(
 *     requireRoles([ROLES.ADMIN, ROLES.VENDEDOR]),
 *     requirePermissions([PERMISSIONS.VENTA_CREATE]),
 *   )
 */
export function composeGuards(...guards: Array<(ctx: GuardCtx) => void>) {
  return (ctx: GuardCtx) => {
    for (const g of guards) g(ctx);
  };
}
