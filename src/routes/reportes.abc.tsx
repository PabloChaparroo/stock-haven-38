import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/reportes/abc")({
  component: () => <ComingSoon title="Análisis ABC" />,
  head: () => ({ meta: [{ title: "Análisis ABC — Inventia" }] }),
});
