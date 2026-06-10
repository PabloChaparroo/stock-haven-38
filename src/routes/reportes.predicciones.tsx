import { createFileRoute } from "@tanstack/react-router";
import { PrediccionesPage } from "@/features/reportes/predicciones/pages/PrediccionesPage";

export const Route = createFileRoute("/reportes/predicciones")({
  component: PrediccionesPage,
  head: () => ({ meta: [{ title: "Predicciones — Inventia" }] }),
});
