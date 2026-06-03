import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articles, categories as initialCategories, type Category } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { SimpleEntityModal } from "@/components/modals/simple-entity-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/categorias")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categorías — Inventia" }] }),
});

function CategoriesPage() {
  const [selected, setSelected] = useState<Category | null>(initialCategories[0]);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [del, setDel] = useState<Category | null>(null);

  const filtered = selected ? articles.filter((a) => a.category === selected.name) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Categorías</h1>
        </div>
        <Button onClick={() => setCreate(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Nueva categoría
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialCategories.map((c) => {
          const active = selected?.id === c.id;
          return (
            <Card
              key={c.id}
              onClick={() => setSelected(c)}
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEdit(c);
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
                      setDel(c);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 text-xs font-mono text-muted-foreground">{c.code}</div>
            </Card>
          );
        })}
      </div>

      {selected && (
        <section className="space-y-3 pt-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-navy">Artículos en</h2>
            <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">
              {selected.name}
            </span>
          </div>
          <ArticlesTable articles={filtered} />
        </section>
      )}

      <SimpleEntityModal open={create} onOpenChange={setCreate} entity="Categoría" />
      <SimpleEntityModal
        open={!!edit}
        onOpenChange={(v) => !v && setEdit(null)}
        entity="Categoría"
        mode="edit"
        initial={edit ?? undefined}
      />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`la categoría "${del?.name}"`}
        onConfirm={() => setDel(null)}
      />
    </div>
  );
}
