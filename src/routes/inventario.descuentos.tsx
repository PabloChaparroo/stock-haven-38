import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/inventario/descuentos")({
  component: () => <ComingSoon title="Descuentos" />,
  head: () => ({ meta: [{ title: "Descuentos — Inventia" }] }),
});
