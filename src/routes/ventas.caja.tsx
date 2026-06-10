import { createFileRoute } from "@tanstack/react-router";
import { CajaPage } from "@/features/ventas/caja/pages/CajaPage";

export const Route = createFileRoute("/ventas/caja")({
  component: CajaPage,
  head: () => ({ meta: [{ title: "Caja — Inventia" }] }),
});
