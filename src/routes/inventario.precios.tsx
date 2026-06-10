import { createFileRoute } from "@tanstack/react-router";
import { PreciosPage } from "@/features/inventario/precios/pages/PreciosPage";

export const Route = createFileRoute("/inventario/precios")({
  component: PreciosPage,
  head: () => ({ meta: [{ title: "Actualización de Precios — Inventia" }] }),
});
