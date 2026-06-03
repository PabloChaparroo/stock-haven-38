import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/compras/proveedores")({
  component: () => <ComingSoon title="Proveedores" />,
  head: () => ({ meta: [{ title: "Proveedores — Inventia" }] }),
});
