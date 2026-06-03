import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { articles, type Article } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/articulos")({
  component: ArticlesPage,
  head: () => ({ meta: [{ title: "Artículos — Inventia" }] }),
});

const PAGE_SIZE = 12;

type StockStatus = "all" | "normal" | "critical" | "out";
type SystemStatus = "active" | "all";

const stockState = (a: Article): "normal" | "critical" | "out" => {
  const total =
    (a.variants?.length ?? 0) > 0
      ? (a.variantStocks ?? []).reduce((s, v) => s + (v.stock || 0), 0)
      : a.stock;
  if (total === 0) return "out";
  if (a.safetyStock && total <= a.safetyStock) return "critical";
  return "normal";
};

function ArticlesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  // Filters (committed values)
  const [stock, setStock] = useState<StockStatus>("all");
  const [system, setSystem] = useState<SystemStatus>("active");
  // Draft (inside popover)
  const [stockDraft, setStockDraft] = useState<StockStatus>("all");
  const [systemDraft, setSystemDraft] = useState<SystemStatus>("active");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (s) {
        const hay = [a.code, a.name, a.brand, a.category, a.supplier ?? ""].join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (stock !== "all" && stockState(a) !== stock) return false;
      // system filter is visual-only (Article has no `active` field); keep as no-op for now
      return true;
    });
  }, [q, stock, system]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilters = (stock !== "all" ? 1 : 0) + (system !== "active" ? 1 : 0);

  const openFilters = (v: boolean) => {
    if (v) {
      setStockDraft(stock);
      setSystemDraft(system);
    }
    setFilterOpen(v);
  };

  const applyFilters = () => {
    setStock(stockDraft);
    setSystem(systemDraft);
    setPage(1);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setStockDraft("all");
    setSystemDraft("active");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Artículos</h1>
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código, nombre, proveedor, marca, categoría"
              className="h-10 w-80 rounded-full pl-10"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Popover open={filterOpen} onOpenChange={openFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 border-border/70">
                <Filter className="h-4 w-4" /> Filtrar
                {activeFilters > 0 && (
                  <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-semibold text-brand-foreground">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b px-4 py-3">
                <div className="text-sm font-semibold text-navy">Filtros de Catálogo</div>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado de Stock
                  </div>
                  <RadioGroup value={stockDraft} onValueChange={(v) => setStockDraft(v as StockStatus)} className="space-y-1.5">
                    <FilterRadio value="all" label="Todos" />
                    <FilterRadio value="normal" label="Stock Normal" dotClass="bg-emerald-500" />
                    <FilterRadio value="critical" label="Stock Crítico" dotClass="bg-amber-500" />
                    <FilterRadio value="out" label="Agotado" dotClass="bg-destructive" />
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado en Sistema
                  </div>
                  <RadioGroup value={systemDraft} onValueChange={(v) => setSystemDraft(v as SystemStatus)} className="space-y-1.5">
                    <FilterRadio value="active" label="Solo Activos" />
                    <FilterRadio value="all" label="Mostrar Inactivos / Discontinuados" />
                  </RadioGroup>
                </div>
              </div>

              <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Limpiar Filtros
                </button>
                <Button
                  type="button"
                  onClick={applyFilters}
                  className="bg-navy text-navy-foreground hover:bg-navy/90"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => setOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Agregar Artículo
          </Button>
        </div>
      </div>

      <ArticlesTable articles={slice} />

      <SimplePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <ArticleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function FilterRadio({ value, label, dotClass }: { value: string; label: string; dotClass?: string }) {
  return (
    <Label
      htmlFor={`f-${value}`}
      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-muted"
    >
      <RadioGroupItem id={`f-${value}`} value={value} />
      {dotClass && <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />}
      <span className="text-foreground">{label}</span>
    </Label>
  );
}
