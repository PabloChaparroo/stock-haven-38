import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/gestion/almacen")({
  component: () => <ComingSoon title="Almacén" />,
  head: () => ({ meta: [{ title: "Almacén — Inventia" }] }),
});
