import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ventas/facturacion")({
  component: () => <ComingSoon title="Facturación de ventas" />,
  head: () => ({ meta: [{ title: "Facturación de ventas — Inventia" }] }),
});
