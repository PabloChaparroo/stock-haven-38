import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/compras/ordenes")({
  component: () => <ComingSoon title="Órdenes de compra" />,
  head: () => ({ meta: [{ title: "Órdenes de compra — Inventia" }] }),
});
