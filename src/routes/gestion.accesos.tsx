import { createFileRoute } from "@tanstack/react-router";
import { AccesosPage } from "@/features/gestion/accesos/pages/AccesosPage";

export const Route = createFileRoute("/gestion/accesos")({
  component: AccesosPage,
  head: () => ({ meta: [{ title: "Accesos — Inventia" }] }),
});
