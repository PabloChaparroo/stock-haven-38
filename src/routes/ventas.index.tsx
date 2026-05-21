import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ventas/")({
  component: () => <ComingSoon title="Ventas" />,
  head: () => ({ meta: [{ title: "Ventas — Inventia" }] }),
});
