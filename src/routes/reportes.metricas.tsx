import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/reportes/metricas")({
  component: () => <ComingSoon title="Métricas" />,
  head: () => ({ meta: [{ title: "Métricas — Inventia" }] }),
});
