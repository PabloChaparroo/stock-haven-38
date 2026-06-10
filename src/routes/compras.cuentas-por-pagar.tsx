import { createFileRoute } from "@tanstack/react-router";
import { CuentasPorPagarPage } from "@/features/compras/cuentas-por-pagar/pages/CuentasPorPagarPage";

export const Route = createFileRoute("/compras/cuentas-por-pagar")({
  component: CuentasPorPagarPage,
  head: () => ({ meta: [{ title: "Cuentas por pagar — Inventia" }] }),
});
