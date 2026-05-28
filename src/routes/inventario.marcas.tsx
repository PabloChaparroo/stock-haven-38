import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Tags, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articles, brands as initialBrands, type Brand } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { SimpleEntityModal } from "@/components/modals/simple-entity-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { LinkArticlesModal } from "@/components/modals/link-articles-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/mock-data";

export const Route = createFileRoute("/inventario/marcas")({
  component: BrandsPage,
  head: () => ({ meta: [{ title: "Marcas — Inventia" }] }),
});

const PAGE_SIZE = 12;

function BrandsPage() {
  const [selected, setSelected] = useState<Brand | null>(initialBrands[0]);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [del, setDel] = useState<Brand | null>(null);
  const [brandPage, setBrandPage] = useState(1);
  const [brandSearch, setBrandSearch] = useState("");
  const [artPage, setArtPage] = useState(1);
  const [artSearch, setArtSearch] = useState("");
  const [addArticle, setAddArticle] = useState(false);
  const [unlink, setUnlink] = useState<Article | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);

  const filteredBrands = useMemo(() => {
    const s = brandSearch.trim().toLowerCase();
    if (!s) return initialBrands;
    return initialBrands.filter((b) => b.name.toLowerCase().includes(s) || b.code.toLowerCase().includes(s));
  }, [brandSearch]);

  const filteredArticles = useMemo(() => {
    if (!selected) return [] as Article[];
    const base = articles.filter((a) => a.brand === selected.name);
    const s = artSearch.trim().toLowerCase();
    if (!s) return base;
    return base.filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s));
  }, [selected, artSearch]);

  const brandTotal = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const brandSlice = filteredBrands.slice((brandPage - 1) * PAGE_SIZE, brandPage * PAGE_SIZE);

  const artTotal = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const artSlice = filteredArticles.slice((artPage - 1) * PAGE_SIZE, artPage * PAGE_SIZE);

  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Marcas</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreate(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Nueva marca
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={brandSearch}
              onChange={(e) => { setBrandSearch(e.target.value); setBrandPage(1); }}
              placeholder="Buscar marca"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brandSlice.map((b) => {
          const active = selected?.id === b.id;
          return (
            <Card
              key={b.id}
              onClick={() => { setSelected(b); setArtPage(1); }}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40" : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Tags className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => { e.stopPropagation(); setEdit(b); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setDel(b); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{b.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
              <div className="mt-3 text-xs font-mono text-muted-foreground">{b.code}</div>
            </Card>
          );
        })}
      </div>

      <SimplePagination page={brandPage} totalPages={brandTotal} onPageChange={setBrandPage} />

      {selected && (
        <section ref={detailRef} className="space-y-3 pt-2 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold text-navy">Artículos de</h2>
              <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">{selected.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setAddArticle(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
                <Plus className="h-4 w-4" /> Agregar artículo
              </Button>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={artSearch}
                  onChange={(e) => { setArtSearch(e.target.value); setArtPage(1); }}
                  placeholder="Buscar artículo"
                  className="h-10 w-64 rounded-full pl-10"
                />
              </div>
            </div>
          </div>
          <ArticlesTable articles={artSlice} onUnlink={setUnlink} unlinkTitle="Desvincular de la marca" />
          <SimplePagination page={artPage} totalPages={artTotal} onPageChange={setArtPage} />
        </section>
      )}

      <SimpleEntityModal open={create} onOpenChange={setCreate} entity="Marca" />
      <SimpleEntityModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} entity="Marca" mode="edit" initial={edit ?? undefined} />
      <DeleteConfirmModal open={!!del} onOpenChange={(v) => !v && setDel(null)} itemName={`la marca "${del?.name}"`} onConfirm={() => setDel(null)} />
      <LinkArticlesModal
        open={addArticle}
        onOpenChange={setAddArticle}
        targetLabel={selected ? `a la marca "${selected.name}"` : undefined}
        excludeIds={filteredArticles.map((a) => a.id)}
      />
      <DeleteConfirmModal
        open={!!unlink}
        onOpenChange={(v) => !v && setUnlink(null)}
        itemName={`el artículo "${unlink?.name}" de esta marca`}
        onConfirm={() => setUnlink(null)}
      />
    </div>
  );
}
