import { createFileRoute } from "@tanstack/react-router";
import { FacturacionPage } from "@/features/ventas/facturacion/pages/FacturacionPage";

export const Route = createFileRoute("/ventas/facturacion")({
  component: FacturacionPage,
  head: () => ({ meta: [{ title: "Facturación — Inventia" }] }),
});
