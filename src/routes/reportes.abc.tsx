import { createFileRoute } from "@tanstack/react-router";
import { AbcPage } from "@/features/reportes/abc/pages/AbcPage";

export const Route = createFileRoute("/reportes/abc")({
  component: AbcPage,
  head: () => ({ meta: [{ title: "ABC — Inventia" }] }),
});
