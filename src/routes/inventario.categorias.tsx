import { createFileRoute } from "@tanstack/react-router";
import { CategoriesPage } from "@/features/inventario/categorias/pages/CategoriesPage";

export const Route = createFileRoute("/inventario/categorias")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categorías — Inventia" }] }),
});
