import { createFileRoute } from "@tanstack/react-router";
import { RecepcionesPage } from "@/features/compras/recepciones/pages/RecepcionesPage";

export const Route = createFileRoute("/compras/recepciones")({
  component: RecepcionesPage,
  head: () => ({ meta: [{ title: "Recepción de Productos — Inventia" }] }),
});
