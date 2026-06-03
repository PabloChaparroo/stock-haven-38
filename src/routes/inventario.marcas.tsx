import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articles, brands as initialBrands, type Brand } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { SimpleEntityModal } from "@/components/modals/simple-entity-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/marcas")({
  component: BrandsPage,
  head: () => ({ meta: [{ title: "Marcas — Inventia" }] }),
});

function BrandsPage() {
  const [selected, setSelected] = useState<Brand | null>(initialBrands[0]);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [del, setDel] = useState<Brand | null>(null);

  const filtered = selected ? articles.filter((a) => a.brand === selected.name) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Marcas</h1>
        </div>
        <Button onClick={() => setCreate(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Nueva marca
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialBrands.map((b) => {
          const active = selected?.id === b.id;
          return (
            <Card
              key={b.id}
              onClick={() => setSelected(b)}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active
                  ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40"
                  : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Tags className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEdit(b);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDel(b);
                    }}
                  >
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

      {selected && (
        <section className="space-y-3 pt-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-navy">Artículos de</h2>
            <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">
              {selected.name}
            </span>
          </div>
          <ArticlesTable articles={filtered} />
        </section>
      )}

      <SimpleEntityModal open={create} onOpenChange={setCreate} entity="Marca" />
      <SimpleEntityModal
        open={!!edit}
        onOpenChange={(v) => !v && setEdit(null)}
        entity="Marca"
        mode="edit"
        initial={edit ?? undefined}
      />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`la marca "${del?.name}"`}
        onConfirm={() => setDel(null)}
      />
    </div>
  );
}
