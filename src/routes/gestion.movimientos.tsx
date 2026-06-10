import { createFileRoute } from "@tanstack/react-router";
import { MovimientosPage } from "@/features/gestion/movimientos/pages/MovimientosPage";

export const Route = createFileRoute("/gestion/movimientos")({
  component: MovimientosPage,
  head: () => ({ meta: [{ title: "Movimientos — Inventia" }] }),
});
