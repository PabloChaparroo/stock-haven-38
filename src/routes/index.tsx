import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [{ title: "Inicio — Inventia" }],
  }),
});

const stats = [
  { label: "Artículos", value: "1.284", icon: Boxes, color: "bg-navy/10 text-navy" },
  { label: "Ventas del mes", value: "$ 4.2M", icon: DollarSign, color: "bg-brand/15 text-brand" },
  { label: "Órdenes activas", value: "37", icon: ShoppingCart, color: "bg-amber-100 text-amber-700" },
  { label: "Crecimiento", value: "+ 12%", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700" },
];

function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Hola, Olivia 👋</h1>
        <p className="mt-1 text-muted-foreground">Resumen rápido de tu operación.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold text-navy">{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Empezá a gestionar</h2>
            <p className="text-sm text-muted-foreground">
              Ingresá al módulo de inventario para administrar tus artículos.
            </p>
          </div>
          <Link
            to="/inventario/articulos"
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:bg-navy/90"
          >
            Ir a Artículos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
