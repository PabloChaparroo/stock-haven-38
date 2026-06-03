import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { articles } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/articulos")({
  component: ArticlesPage,
  head: () => ({ meta: [{ title: "Artículos — Inventia" }] }),
});

function ArticlesPage() {
  const [open, setOpen] = useState(false);

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

      <ArticlesTable articles={articles} />

      <Pagination />

      <ArticleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Pagination() {
  const [page, setPage] = useState(4);
  const pages = [1, 2, 3, 4, 15];
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => setPage(p)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full text-sm font-medium transition",
            page === p
              ? "bg-brand text-brand-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {p}
        </button>
      ))}
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPage((p) => p + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
