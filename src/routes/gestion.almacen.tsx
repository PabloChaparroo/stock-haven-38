import { createFileRoute } from "@tanstack/react-router";
import { AlmacenPage } from "@/features/gestion/almacen/pages/AlmacenPage";

export const Route = createFileRoute("/gestion/almacen")({
  component: AlmacenPage,
  head: () => ({ meta: [{ title: "Almacén — Inventia" }] }),
});
