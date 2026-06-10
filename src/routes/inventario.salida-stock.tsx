import { createFileRoute } from "@tanstack/react-router";
import { SalidaStockPage } from "@/features/inventario/salida-stock/pages/SalidaStockPage";

export const Route = createFileRoute("/inventario/salida-stock")({
  component: SalidaStockPage,
  head: () => ({ meta: [{ title: "Salida de Stock — Inventia" }] }),
});
