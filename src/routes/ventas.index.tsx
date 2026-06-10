import { createFileRoute } from "@tanstack/react-router";
import { requirePermissions, PERMISSIONS } from "@/core/auth";
import { POSPage } from "@/features/ventas/punto-venta/pages/POSPage";

export const Route = createFileRoute("/ventas/")({
  beforeLoad: requirePermissions([PERMISSIONS.VENTA_CREATE]),
  component: POSPage,
  head: () => ({ meta: [{ title: "Punto de Venta — Inventia" }] }),
});
