import { createFileRoute } from "@tanstack/react-router";
import { SuppliersPage } from "@/features/compras/proveedores/pages/SuppliersPage";

export const Route = createFileRoute("/compras/proveedores")({
  component: SuppliersPage,
  head: () => ({ meta: [{ title: "Proveedores — Inventia" }] }),
});
