import { useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { articles, type Article } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type StockState = "todos" | "normal" | "critico" | "agotado";
type SystemState = "activos" | "inactivos";

const DEFAULT_FILTERS = { stock: "todos" as StockState, system: "activos" as SystemState };

function totalStock(a: Article) {
  if (a.variants && a.variants.length > 0) {
    return (a.variantStocks ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
  }
  return a.stock;
}

function stockStateOf(a: Article): Exclude<StockState, "todos"> {
  const s = totalStock(a);
  if (s === 0) return "agotado";
  if (s <= a.safetyStock) return "critico";
  return "normal";
}

export function ArticlesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);

  const activeFilterCount =
    (applied.stock !== "todos" ? 1 : 0) + (applied.system !== "activos" ? 1 : 0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (s) {
        const hay = [a.code, a.name, a.brand, a.category, a.description].join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (applied.stock !== "todos" && stockStateOf(a) !== applied.stock) return false;
      // System state: dataset doesn't track inactive; treat all as active.
      // "inactivos" shows all (active + inactive) per UX expectation.
      return true;
    });
  }, [q, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const apply = () => {
    setApplied(draft);
    setPage(1);
    setFiltersOpen(false);
  };
  const clear = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Artículos</h1>
        </div>

        <div className="flex items-center gap-2">
          <Popover
            open={filtersOpen}
            onOpenChange={(o) => {
              setFiltersOpen(o);
              if (o) setDraft(applied);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2 border-border/70",
                  activeFilterCount > 0 && "border-brand text-brand",
                )}
              >
                <Filter className="h-4 w-4" />
                Filtrar
                {activeFilterCount > 0 && (
                  <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-semibold text-brand-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
              <div className="border-b px-4 py-3">
                <div className="text-sm font-semibold text-navy">Filtros de Catálogo</div>
              </div>

              <div className="space-y-5 px-4 py-4">
                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado de Stock
                  </div>
                  <RadioGroup
                    value={draft.stock}
                    onValueChange={(v) => setDraft((d) => ({ ...d, stock: v as StockState }))}
                    className="gap-2"
                  >
                    <FilterRadio value="todos" id="fs-todos" label="Todos" />
                    <FilterRadio
                      value="normal"
                      id="fs-normal"
                      label="Stock Normal"
                      badge={<Badge dot="bg-emerald-500" text="text-emerald-700" bg="bg-emerald-100">Normal</Badge>}
                    />
                    <FilterRadio
                      value="critico"
                      id="fs-critico"
                      label="Stock Crítico"
                      badge={<Badge dot="bg-amber-500" text="text-amber-700" bg="bg-amber-100">Crítico</Badge>}
                    />
                    <FilterRadio
                      value="agotado"
                      id="fs-agotado"
                      label="Agotado"
                      badge={<Badge dot="bg-red-500" text="text-red-700" bg="bg-red-100">Agotado</Badge>}
                    />
                  </RadioGroup>
                </section>

                <Separator />

                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado en Sistema
                  </div>
                  <RadioGroup
                    value={draft.system}
                    onValueChange={(v) => setDraft((d) => ({ ...d, system: v as SystemState }))}
                    className="gap-2"
                  >
                    <FilterRadio value="activos" id="sys-act" label="Solo Activos" />
                    <FilterRadio
                      value="inactivos"
                      id="sys-inact"
                      label="Mostrar Inactivos / Discontinuados"
                    />
                  </RadioGroup>
                </section>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Limpiar Filtros
                </button>
                <Button onClick={apply} className="bg-navy text-navy-foreground hover:bg-navy/90">
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por código, nombre, marca o categoría"
          className="h-10 rounded-full pl-10"
        />
      </div>

      <ArticlesTable articles={slice} />

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ArticleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function FilterRadio({
  value,
  id,
  label,
  badge,
}: {
  value: string;
  id: string;
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm font-normal hover:bg-muted"
    >
      <span className="flex items-center gap-2.5">
        <RadioGroupItem value={value} id={id} />
        <span className="text-foreground">{label}</span>
      </span>
      {badge}
    </Label>
  );
}

function Badge({
  dot,
  bg,
  text,
  children,
}: {
  dot: string;
  bg: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", bg, text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}
