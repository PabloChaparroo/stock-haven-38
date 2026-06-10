import { createFileRoute } from "@tanstack/react-router";
import { MetricasPage } from "@/features/reportes/metricas/pages/MetricasPage";

export const Route = createFileRoute("/reportes/metricas")({
  component: MetricasPage,
  head: () => ({ meta: [{ title: "Métricas — Inventia" }] }),
});
