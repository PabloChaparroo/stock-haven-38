import { createFileRoute } from "@tanstack/react-router";
import { HistorialPage } from "@/features/ventas/historial/pages/HistorialPage";

export const Route = createFileRoute("/ventas/historial")({
  component: HistorialPage,
  head: () => ({ meta: [{ title: "Historial de Ventas — Inventia" }] }),
});
