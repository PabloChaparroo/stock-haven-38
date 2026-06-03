import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, LayoutGrid, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articles, categories as initialCategories, type Category } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { SimpleEntityModal } from "@/components/modals/simple-entity-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { LinkArticlesModal } from "@/components/modals/link-articles-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/mock-data";

export const Route = createFileRoute("/inventario/categorias")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categorías — Inventia" }] }),
});

const PAGE_SIZE = 12;
type StatusFilter = "active" | "inactive";

function CategoriesPage() {
  const [selected, setSelected] = useState<Category | null>(initialCategories[0]);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const [catPage, setCatPage] = useState(1);
  const [artPage, setArtPage] = useState(1);
  const [addArticle, setAddArticle] = useState(false);
  const [unlink, setUnlink] = useState<Article | null>(null);
  const [catQuery, setCatQuery] = useState("");
  const [artQuery, setArtQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const detailRef = useRef<HTMLElement | null>(null);

  const filteredCats = useMemo(() => {
    const s = catQuery.trim().toLowerCase();
    return initialCategories
      .filter((c) => (status === "active" ? c.active : !c.active))
      .filter((c) => (!s ? true : c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)));
  }, [catQuery, status]);

  const filteredArts = useMemo(() => {
    if (!selected) return [];
    const s = artQuery.trim().toLowerCase();
    return articles
      .filter((a) => a.category === selected.name)
      .filter((a) =>
        !s
          ? true
          : [a.code, a.name, a.brand, a.category].join(" ").toLowerCase().includes(s),
      );
  }, [selected, artQuery]);

  const catTotal = Math.max(1, Math.ceil(filteredCats.length / PAGE_SIZE));
  const catSlice = filteredCats.slice((catPage - 1) * PAGE_SIZE, catPage * PAGE_SIZE);

  const artTotal = Math.max(1, Math.ceil(filteredArts.length / PAGE_SIZE));
  const artSlice = filteredArts.slice((artPage - 1) * PAGE_SIZE, artPage * PAGE_SIZE);

  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Categorías</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border bg-card p-1">
            {(["active", "inactive"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setCatPage(1);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition",
                  status === s ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-navy",
                )}
              >
                {s === "active" ? "Activas" : "Inactivas"}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreate(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Nueva categoría
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={catQuery}
              onChange={(e) => { setCatQuery(e.target.value); setCatPage(1); }}
              placeholder="Buscar por código o nombre"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {catSlice.map((c) => {
          const active = selected?.id === c.id;
          return (
            <Card
              key={c.id}
              onClick={() => {
                setSelected(c);
                setArtPage(1);
                setArtQuery("");
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active
                  ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40"
                  : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy/10 text-navy">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => { e.stopPropagation(); setEdit(c); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setDel(c); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{c.code}</span>
                {!c.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Inactiva</span>
                )}
              </div>
            </Card>
          );
        })}
        {catSlice.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">No hay categorías para mostrar.</div>
        )}
      </div>

      <SimplePagination page={catPage} totalPages={catTotal} onPageChange={setCatPage} />

      {selected && (
        <section ref={detailRef} className="space-y-3 pt-2 scroll-mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold text-navy">Artículos en</h2>
              <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">
                {selected.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setAddArticle(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
                <Plus className="h-4 w-4" /> Agregar artículo
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={artQuery}
                  onChange={(e) => { setArtQuery(e.target.value); setArtPage(1); }}
                  placeholder="Buscar artículo"
                  className="h-10 w-72 rounded-full pl-10"
                />
              </div>
            </div>
          </div>
          <ArticlesTable articles={artSlice} onUnlink={setUnlink} unlinkTitle="Desvincular de la categoría" hideDelete hideEdit />
          <SimplePagination page={artPage} totalPages={artTotal} onPageChange={setArtPage} />
        </section>
      )}

      <SimpleEntityModal open={create} onOpenChange={setCreate} entity="Categoría" />
      <SimpleEntityModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} entity="Categoría" mode="edit" initial={edit ?? undefined} />
      <DeleteConfirmModal open={!!del} onOpenChange={(v) => !v && setDel(null)} itemName={`la categoría "${del?.name}"`} onConfirm={() => setDel(null)} />
      <LinkArticlesModal
        open={addArticle}
        onOpenChange={setAddArticle}
        targetLabel={selected ? `a la categoría "${selected.name}"` : undefined}
        excludeIds={filteredArts.map((a) => a.id)}
      />
      <DeleteConfirmModal
        open={!!unlink}
        onOpenChange={(v) => !v && setUnlink(null)}
        itemName={`el artículo "${unlink?.name}" de esta categoría`}
        onConfirm={() => setUnlink(null)}
      />
    </div>
  );
}
