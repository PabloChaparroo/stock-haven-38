import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/gestion/usuarios/pages/UsersPage";

export const Route = createFileRoute("/gestion/usuarios")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Usuarios — Inventia" }] }),
});
