import { createFileRoute } from "@tanstack/react-router";
import { FacturacionComprasPage } from "@/features/compras/facturacion/pages/FacturacionComprasPage";

export const Route = createFileRoute("/compras/facturacion")({
  component: FacturacionComprasPage,
  head: () => ({ meta: [{ title: "Facturación de compras — Inventia" }] }),
});
