import { createFileRoute } from "@tanstack/react-router";
import { requirePermissions, PERMISSIONS } from "@/core/auth";
import { ArticlesPage } from "@/features/inventario/articulos/pages/ArticlesPage";

export const Route = createFileRoute("/inventario/articulos")({
  beforeLoad: requirePermissions([PERMISSIONS.INVENTARIO_VIEW]),
  component: ArticlesPage,
  head: () => ({ meta: [{ title: "Artículos — Inventia" }] }),
});
