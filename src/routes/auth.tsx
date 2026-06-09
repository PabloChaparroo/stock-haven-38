import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authStore, ROLE_PERMISSIONS, ROLES, type Role } from "@/core/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
  }),
  head: () => ({ meta: [{ title: "Iniciar sesión — Inventia" }] }),
});

function AuthPage() {
  const { redirect } = Route.useSearch();

  function loginAs(role: Role) {
    authStore.signIn({
      id: `mock-${role}`,
      email: `${role.toLowerCase()}@inventia.dev`,
      name: role,
      roles: [role],
      permissions: ROLE_PERMISSIONS[role],
    });
    window.location.href = redirect;
  }

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Inicio de sesión (mock)</h1>
          <p className="text-sm text-muted-foreground">
            Elegí un rol para probar los guards de ruta.
          </p>
        </div>
        <div className="grid gap-2">
          {Object.values(ROLES).map((r) => (
            <Button key={r} variant="outline" onClick={() => loginAs(r)}>
              Entrar como {r}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full text-destructive"
          onClick={() => {
            authStore.signOut();
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
