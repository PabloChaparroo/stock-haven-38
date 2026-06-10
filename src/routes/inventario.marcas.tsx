import { createFileRoute } from "@tanstack/react-router";
import { BrandsPage } from "@/features/inventario/marcas/pages/BrandsPage";

export const Route = createFileRoute("/inventario/marcas")({
  component: BrandsPage,
  head: () => ({ meta: [{ title: "Marcas — Inventia" }] }),
});
