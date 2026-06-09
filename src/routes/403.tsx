import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/403")({
  component: ForbiddenPage,
  validateSearch: (s: Record<string, unknown>) => ({
    from: typeof s.from === "string" ? s.from : undefined,
  }),
  head: () => ({ meta: [{ title: "Acceso denegado — Inventia" }] }),
});

function ForbiddenPage() {
  const { from } = Route.useSearch();
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-navy">403 — Acceso denegado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No tenés permisos suficientes para acceder a esta sección
          {from ? <> (<code className="text-xs">{from}</code>)</> : null}.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild className="bg-navy text-navy-foreground hover:bg-navy/90">
            <Link to="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
