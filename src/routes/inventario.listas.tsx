import { createFileRoute } from "@tanstack/react-router";
import { ListsPage } from "@/features/inventario/listas/pages/ListsPage";

export const Route = createFileRoute("/inventario/listas")({
  component: ListsPage,
  head: () => ({ meta: [{ title: "Listas — Inventia" }] }),
});
