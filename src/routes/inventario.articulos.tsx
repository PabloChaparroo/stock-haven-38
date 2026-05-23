import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { articles } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";

export const Route = createFileRoute("/inventario/articulos")({
  component: ArticlesPage,
  head: () => ({ meta: [{ title: "Artículos — Inventia" }] }),
});

const PAGE_SIZE = 12;

function ArticlesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const slice = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Artículos</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border/70">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Agregar Artículo
          </Button>
        </div>
      </div>

      <ArticlesTable articles={slice} />

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ArticleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
