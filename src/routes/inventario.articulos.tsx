import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articles as allArticles } from "@/lib/mock-data";
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
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allArticles;
    return allArticles.filter(
      (a) => a.name.toLowerCase().includes(s) || a.code.includes(s) || a.brand.toLowerCase().includes(s),
    );
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Artículos</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border/70">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar artículo"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
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
