import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ventas/caja")({
  component: () => <ComingSoon title="Caja" />,
  head: () => ({ meta: [{ title: "Caja — Inventia" }] }),
});
