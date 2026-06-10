import { createFileRoute } from "@tanstack/react-router";
import { DiscountsPage } from "@/features/inventario/descuentos/pages/DiscountsPage";

export const Route = createFileRoute("/inventario/descuentos")({
  component: DiscountsPage,
  head: () => ({ meta: [{ title: "Descuentos — Inventia" }] }),
});
