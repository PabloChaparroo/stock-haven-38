import { createFileRoute } from "@tanstack/react-router";
import { ClientsPage } from "@/features/ventas/clientes/pages/ClientsPage";

export const Route = createFileRoute("/ventas/clientes")({
  component: ClientsPage,
  head: () => ({ meta: [{ title: "Clientes — Inventia" }] }),
});
