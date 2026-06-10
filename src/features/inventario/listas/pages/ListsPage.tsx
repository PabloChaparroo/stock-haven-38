import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, List as ListIcon, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articles, priceLists as initialLists, type Article, type PriceList } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ListFormModal } from "@/components/modals/list-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { LinkArticlesModal } from "@/components/modals/link-articles-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
type StatusFilter = "active" | "inactive";

export function ListsPage() {
  const [selected, setSelected] = useState<PriceList | null>(initialLists[0]);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<PriceList | null>(null);
  const [del, setDel] = useState<PriceList | null>(null);
  const [listPage, setListPage] = useState(1);
  const [artPage, setArtPage] = useState(1);
  const [addArticle, setAddArticle] = useState(false);
  const [unlink, setUnlink] = useState<Article | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [artQuery, setArtQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const detailRef = useRef<HTMLElement | null>(null);

  const filteredLists = useMemo(() => {
    const s = listQuery.trim().toLowerCase();
    return initialLists
      .filter((l) => (status === "active" ? l.active : !l.active))
      .filter((l) =>
        !s ? true : l.name.toLowerCase().includes(s) || l.code.toLowerCase().includes(s),
      );
  }, [listQuery, status]);

  const filteredArts = useMemo(() => {
    if (!selected) return [];
    const s = artQuery.trim().toLowerCase();
    const arts = selected.articleIds
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is Article => !!a);
    return arts.filter((a) =>
      !s ? true : [a.code, a.name, a.brand, a.category].join(" ").toLowerCase().includes(s),
    );
  }, [selected, artQuery]);

  const listTotal = Math.max(1, Math.ceil(filteredLists.length / PAGE_SIZE));
  const listSlice = filteredLists.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);

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
          <h1 className="text-2xl font-bold text-navy">Listas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border bg-card p-1">
            {(["active", "inactive"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setListPage(1); }}
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
            <Plus className="h-4 w-4" /> Nueva lista
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={listQuery}
              onChange={(e) => { setListQuery(e.target.value); setListPage(1); }}
              placeholder="Buscar por código o nombre"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listSlice.map((l) => {
          const active = selected?.id === l.id;
          return (
            <Card
              key={l.id}
              onClick={() => { setSelected(l); setArtPage(1); setArtQuery(""); }}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active
                  ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40"
                  : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy/10 text-navy">
                  <ListIcon className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => { e.stopPropagation(); setEdit(l); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setDel(l); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{l.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description ?? "Sin descripción."}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{l.code}</span>
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand">
                  {l.articleIds.length} art.
                </span>
                {!l.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Inactiva</span>
                )}
              </div>
            </Card>
          );
        })}
        {listSlice.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">No hay listas para mostrar.</div>
        )}
      </div>

      <SimplePagination page={listPage} totalPages={listTotal} onPageChange={setListPage} />

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
          <ArticlesTable articles={artSlice} onUnlink={setUnlink} unlinkTitle="Desvincular de la lista" hideDelete hideEdit />
          <SimplePagination page={artPage} totalPages={artTotal} onPageChange={setArtPage} />
        </section>
      )}

      <ListFormModal open={create} onOpenChange={setCreate} />
      <ListFormModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} mode="edit" initial={edit ?? undefined} />
      <DeleteConfirmModal open={!!del} onOpenChange={(v) => !v && setDel(null)} itemName={`la lista "${del?.name}"`} onConfirm={() => setDel(null)} />
      <LinkArticlesModal
        open={addArticle}
        onOpenChange={setAddArticle}
        targetLabel={selected ? `a la lista "${selected.name}"` : undefined}
        excludeIds={selected?.articleIds ?? []}
      />
      <DeleteConfirmModal
        open={!!unlink}
        onOpenChange={(v) => !v && setUnlink(null)}
        itemName={`el artículo "${unlink?.name}" de esta lista`}
        onConfirm={() => setUnlink(null)}
      />
    </div>
  );
}
