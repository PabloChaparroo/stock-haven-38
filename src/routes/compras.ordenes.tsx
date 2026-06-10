import { createFileRoute } from "@tanstack/react-router";
import { OrdenesPage } from "@/features/compras/ordenes/pages/OrdenesPage";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesPage,
  head: () => ({ meta: [{ title: "Orden de compra — Inventia" }] }),
});
