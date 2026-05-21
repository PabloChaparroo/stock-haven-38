import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/gestion/usuarios")({
  component: () => <ComingSoon title="Usuarios" />,
  head: () => ({ meta: [{ title: "Usuarios — Inventia" }] }),
});
