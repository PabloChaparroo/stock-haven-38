import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type StockFilter = "all" | "normal" | "critical" | "out";
export type StatusFilter = "active" | "inactive";

export type CatalogFilterValue = {
  stock: StockFilter;
  status: StatusFilter;
};

export const DEFAULT_CATALOG_FILTER: CatalogFilterValue = {
  stock: "all",
  status: "active",
};

type Props = {
  value: CatalogFilterValue;
  onChange: (v: CatalogFilterValue) => void;
};

export function CatalogFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogFilterValue>(value);

  const activeCount =
    (value.stock !== "all" ? 1 : 0) + (value.status !== "active" ? 1 : 0);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(value); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative gap-2 border-border/70">
          <Filter className="h-4 w-4" /> Filtrar
          {activeCount > 0 && (
            <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="mb-3 text-sm font-semibold text-navy">Filtros de Catálogo</div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado de Stock
            </Label>
            <RadioGroup
              value={draft.stock}
              onValueChange={(v) => setDraft((d) => ({ ...d, stock: v as StockFilter }))}
              className="space-y-1.5"
            >
              {[
                { v: "all", label: "Todos", dot: "bg-muted-foreground/40" },
                { v: "normal", label: "Stock Normal", dot: "bg-emerald-500" },
                { v: "critical", label: "Stock Crítico", dot: "bg-amber-500" },
                { v: "out", label: "Agotado", dot: "bg-destructive" },
              ].map((o) => (
                <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40">
                  <RadioGroupItem value={o.v} id={`stk-${o.v}`} />
                  <span className={`h-2 w-2 rounded-full ${o.dot}`} />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado en Sistema
            </Label>
            <RadioGroup
              value={draft.status}
              onValueChange={(v) => setDraft((d) => ({ ...d, status: v as StatusFilter }))}
              className="space-y-1.5"
            >
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40">
                <RadioGroupItem value="active" id="st-act" />
                <span className="text-sm">Solo Activos</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40">
                <RadioGroupItem value="inactive" id="st-inact" />
                <span className="text-sm">Mostrar Inactivos / Discontinuados</span>
              </label>
            </RadioGroup>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t pt-3">
          <button
            type="button"
            onClick={() => { setDraft(DEFAULT_CATALOG_FILTER); onChange(DEFAULT_CATALOG_FILTER); setOpen(false); }}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Limpiar Filtros
          </button>
          <Button
            onClick={() => { onChange(draft); setOpen(false); }}
            className="bg-navy text-navy-foreground hover:bg-navy/90"
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Helper para filtrar artículos por estado de stock */
export function filterByStock<T extends { stock: number; safetyStock: number; variants?: unknown[]; variantStocks?: { stock: number; safetyStock?: number }[] }>(
  list: T[],
  stock: StockFilter,
): T[] {
  if (stock === "all") return list;
  return list.filter((a) => {
    const hasVar = (a.variants?.length ?? 0) > 0;
    const total = hasVar
      ? (a.variantStocks ?? []).reduce((s, v) => s + v.stock, 0)
      : a.stock;
    const safety = hasVar
      ? (a.variantStocks ?? []).reduce((s, v) => s + (v.safetyStock ?? 0), 0)
      : a.safetyStock;
    if (stock === "out") return total === 0;
    if (stock === "critical") return total > 0 && total <= safety;
    if (stock === "normal") return total > safety;
    return true;
  });
}
