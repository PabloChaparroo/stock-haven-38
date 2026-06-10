import { Fragment, useMemo, useState } from "react";
import { Filter, Search, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { articles, type Article } from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 12;

type NewStockMap = Record<string, string>;
type ReasonMap = Record<string, string>;
type ReasonNoteMap = Record<string, string>;

type StockState = "todos" | "normal" | "critico" | "agotado";
type SystemState = "activos" | "inactivos";

const DEFAULT_FILTERS = { stock: "todos" as StockState, system: "activos" as SystemState };

const REASONS = [
  "Sobrante de inventario",
  "Ingreso de muestras",
  "Devolución interna",
  "Ajuste inicial de sistema",
  "Otros",
] as const;

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

export function AjusteStockPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newStock, setNewStock] = useState<NewStockMap>({});
  const [reason, setReason] = useState<ReasonMap>({});
  const [reasonNote, setReasonNote] = useState<ReasonNoteMap>({});

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);

  const activeFilterCount =
    (applied.stock !== "todos" ? 1 : 0) + (applied.system !== "activos" ? 1 : 0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (s && ![a.code, a.name, a.brand, a.category].join(" ").toLowerCase().includes(s))
        return false;
      if (applied.stock !== "todos" && stockStateOf(a) !== applied.stock) return false;
      return true;
    });
  }, [q, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasChanges = Object.values(newStock).some((v) => v !== "" && v != null);

  const setVal = (key: string, v: string) => setNewStock((p) => ({ ...p, [key]: v }));
  const setReasonVal = (key: string, v: string) => setReason((p) => ({ ...p, [key]: v }));
  const setReasonNoteVal = (key: string, v: string) =>
    setReasonNote((p) => ({ ...p, [key]: v }));

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

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

  const handleSave = () => {
    toast.success("Cambios de stock guardados correctamente.");
    setNewStock({});
    setReason({});
    setReasonNote({});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Ajuste de Stock</h1>
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
                    <FilterRadio value="todos" id="as-todos" label="Todos" />
                    <FilterRadio
                      value="normal"
                      id="as-normal"
                      label="Stock Normal"
                      badge={<Badge dot="bg-emerald-500" text="text-emerald-700" bg="bg-emerald-100">Normal</Badge>}
                    />
                    <FilterRadio
                      value="critico"
                      id="as-critico"
                      label="Stock Crítico"
                      badge={<Badge dot="bg-amber-500" text="text-amber-700" bg="bg-amber-100">Crítico</Badge>}
                    />
                    <FilterRadio
                      value="agotado"
                      id="as-agotado"
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
                    <FilterRadio value="activos" id="as-sys-act" label="Solo Activos" />
                    <FilterRadio
                      value="inactivos"
                      id="as-sys-inact"
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

          <Button
            disabled={!hasChanges}
            onClick={handleSave}
            className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Guardar Cambios
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

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10" />
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Nombre</TableHead>
              <TableHead className="text-navy">Marca</TableHead>
              <TableHead className="text-navy">Categoría</TableHead>
              <TableHead className="text-navy">Imagen</TableHead>
              <TableHead className="text-navy">Stock Actual</TableHead>
              <TableHead className="text-navy">Stock Seg.</TableHead>
              <TableHead className="text-navy">Nuevo Stock</TableHead>
              <TableHead className="text-navy min-w-[200px]">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((a) => {
              const hasVariants = (a.variants?.length ?? 0) > 0;
              const isOpen = !!expanded[a.id];
              const low = !hasVariants && a.stock < a.safetyStock;
              return (
                <Fragment key={a.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      {hasVariants && (
                        <button
                          onClick={() => toggle(a.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-navy hover:bg-navy/10"
                        >
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell className="font-medium text-navy">{a.name}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                        {a.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-md border bg-muted/40">
                        <img src={a.image} alt={a.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    </TableCell>
                    {hasVariants ? (
                      <>
                        <TableCell className="text-sm text-muted-foreground italic">
                          Ver variantes
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">—</TableCell>
                        <TableCell className="text-sm text-muted-foreground italic">
                          Editar por variante
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground italic">
                          Por variante
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold",
                              low ? "bg-destructive/10 text-destructive" : "bg-brand/10 text-navy",
                            )}
                          >
                            {a.stock}
                          </span>
                        </TableCell>
                        <TableCell>{a.safetyStock}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={newStock[a.id] ?? ""}
                            onChange={(e) => setVal(a.id, e.target.value)}
                            placeholder="—"
                            className="h-9 w-24 focus-visible:ring-brand"
                          />
                        </TableCell>
                        <TableCell>
                          <ReasonPicker
                            value={reason[a.id]}
                            note={reasonNote[a.id]}
                            onChange={(v) => setReasonVal(a.id, v)}
                            onNoteChange={(v) => setReasonNoteVal(a.id, v)}
                          />
                        </TableCell>
                      </>
                    )}
                  </TableRow>

                  {hasVariants && isOpen && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={10} className="py-3">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                            Variantes — {a.name}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-8 text-navy">Código</TableHead>
                                <TableHead className="h-8 text-navy">Variante</TableHead>
                                <TableHead className="h-8 text-navy">Stock Actual</TableHead>
                                <TableHead className="h-8 text-navy">Stock Seg.</TableHead>
                                <TableHead className="h-8 text-navy">Nuevo Stock</TableHead>
                                <TableHead className="h-8 text-navy min-w-[200px]">Motivo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {a.variants!.map((v) => {
                                const vs = a.variantStocks?.find((s) => s.variantId === v.id);
                                const key = `${a.id}:${v.id}`;
                                return (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-mono text-xs">{v.code}</TableCell>
                                    <TableCell className="font-medium text-navy">{v.name}</TableCell>
                                    <TableCell className="font-semibold">{vs?.stock ?? 0}</TableCell>
                                    <TableCell>{vs?.safetyStock ?? "—"}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={newStock[key] ?? ""}
                                        onChange={(e) => setVal(key, e.target.value)}
                                        placeholder="—"
                                        className="h-9 w-24 focus-visible:ring-brand"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <ReasonPicker
                                        value={reason[key]}
                                        note={reasonNote[key]}
                                        onChange={(val) => setReasonVal(key, val)}
                                        onNoteChange={(val) => setReasonNoteVal(key, val)}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function ReasonPicker({
  value,
  note,
  onChange,
  onNoteChange,
}: {
  value?: string;
  note?: string;
  onChange: (v: string) => void;
  onNoteChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[200px]">
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 focus:ring-brand">
          <SelectValue placeholder="Seleccionar motivo" />
        </SelectTrigger>
        <SelectContent>
          {REASONS.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === "Otros" && (
        <Input
          value={note ?? ""}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Especificar motivo…"
          className="h-9 focus-visible:ring-brand"
        />
      )}
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
