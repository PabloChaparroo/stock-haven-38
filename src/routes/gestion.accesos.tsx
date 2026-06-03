import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/gestion/accesos")({
  component: () => <ComingSoon title="Accesos" />,
  head: () => ({ meta: [{ title: "Accesos — Inventia" }] }),
});
