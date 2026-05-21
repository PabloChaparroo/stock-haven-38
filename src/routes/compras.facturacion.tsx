import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/compras/facturacion")({
  component: () => <ComingSoon title="Facturación de compras" />,
  head: () => ({ meta: [{ title: "Facturación de compras — Inventia" }] }),
});
