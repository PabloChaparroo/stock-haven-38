import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/gestion/movimientos")({
  component: () => <ComingSoon title="Movimientos" />,
  head: () => ({ meta: [{ title: "Movimientos — Inventia" }] }),
});
