import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/reportes/predicciones")({
  component: () => <ComingSoon title="Predicciones" />,
  head: () => ({ meta: [{ title: "Predicciones — Inventia" }] }),
});
