import { createFileRoute } from "@tanstack/react-router";
import { AjusteStockPage } from "@/features/inventario/ajuste-stock/pages/AjusteStockPage";

export const Route = createFileRoute("/inventario/ajuste-stock")({
  component: AjusteStockPage,
  head: () => ({ meta: [{ title: "Ajuste de Stock — Inventia" }] }),
});
