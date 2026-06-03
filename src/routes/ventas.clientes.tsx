import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ventas/clientes")({
  component: () => <ComingSoon title="Clientes" />,
  head: () => ({ meta: [{ title: "Clientes — Inventia" }] }),
});
