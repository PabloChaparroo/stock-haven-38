import { Fragment, useMemo, useState } from "react";
import { Search, Save, ChevronDown, ChevronUp, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { articles, type Article } from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOTIVOS = ["DAÑADO", "EXTRAVÍO", "PÉRDIDA", "RETIRO", "ROBO"] as const;
type Motivo = (typeof MOTIVOS)[number];
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

type Row = { motivo: Motivo | ""; cantidad: string };
type RowsMap = Record<string, Row>; // key = articleId or `${articleId}:${variantId}`

export function SalidaStockPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<RowsMap>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const setRow = (key: string, patch: Partial<Row>) =>
    setRows((p) => {
      const base: Row = p[key] ?? { motivo: "", cantidad: "" };
      return { ...p, [key]: { ...base, ...patch } };
    });

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // collect pending registers (qty > 0 with motivo)
  const pending = useMemo(() => {
    const out: Array<{
      key: string;
      article: (typeof articles)[number];
      variantId?: string;
      variantName?: string;
      stock: number;
      cantidad: number;
      motivo: Motivo | "";
    }> = [];
    for (const [key, row] of Object.entries(rows)) {
      const qty = Number(row.cantidad);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const [aid, vid] = key.split(":");
      const article = articles.find((a) => a.id === aid);
      if (!article) continue;
      if (vid) {
        const v = article.variants?.find((x) => x.id === vid);
        const vs = article.variantStocks?.find((x) => x.variantId === vid);
        out.push({
          key,
          article,
          variantId: vid,
          variantName: v?.name ?? vid,
          stock: vs?.stock ?? 0,
          cantidad: qty,
          motivo: row.motivo,
        });
      } else {
        out.push({ key, article, stock: article.stock, cantidad: qty, motivo: row.motivo });
      }
    }
    return out;
  }, [rows]);

  const canSave = pending.length > 0 && pending.every((p) => p.motivo && p.cantidad <= p.stock);

  const handleConfirm = () => {
    toast.success(`Se registraron ${pending.length} salida(s) de stock.`);
    setRows({});
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Salida de Stock</h1>
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
                    <FilterRadio value="todos" id="ss-todos" label="Todos" />
                    <FilterRadio
                      value="normal"
                      id="ss-normal"
                      label="Stock Normal"
                      badge={<MiniBadge dot="bg-emerald-500" text="text-emerald-700" bg="bg-emerald-100">Normal</MiniBadge>}
                    />
                    <FilterRadio
                      value="critico"
                      id="ss-critico"
                      label="Stock Crítico"
                      badge={<MiniBadge dot="bg-amber-500" text="text-amber-700" bg="bg-amber-100">Crítico</MiniBadge>}
                    />
                    <FilterRadio
                      value="agotado"
                      id="ss-agotado"
                      label="Agotado"
                      badge={<MiniBadge dot="bg-red-500" text="text-red-700" bg="bg-red-100">Agotado</MiniBadge>}
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
                    <FilterRadio value="activos" id="ss-sys-act" label="Solo Activos" />
                    <FilterRadio value="inactivos" id="ss-sys-inact" label="Mostrar Inactivos / Discontinuados" />
                  </RadioGroup>
                </section>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(DEFAULT_FILTERS);
                    setApplied(DEFAULT_FILTERS);
                    setPage(1);
                  }}
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Limpiar Filtros
                </button>
                <Button
                  onClick={() => {
                    setApplied(draft);
                    setPage(1);
                    setFiltersOpen(false);
                  }}
                  className="bg-navy text-navy-foreground hover:bg-navy/90"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            disabled={!canSave}
            onClick={() => setConfirmOpen(true)}
            className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Guardar Salida
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-md">
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
        {pending.length > 0 && (
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            {pending.length} ítem(s) a retirar
          </span>
        )}
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
              <TableHead className="text-navy">Stock Actual</TableHead>
              <TableHead className="text-navy">Motivo</TableHead>
              <TableHead className="text-navy">Cantidad a Retirar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((a) => {
              const hasVariants = (a.variants?.length ?? 0) > 0;
              const isOpen = !!expanded[a.id];
              const row = rows[a.id] ?? { motivo: "", cantidad: "" };
              const qty = Number(row.cantidad);
              const over = !hasVariants && qty > a.stock;
              return (
                <Fragment key={a.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      {hasVariants && (
                        <button
                          onClick={() => toggle(a.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-navy hover:bg-navy/10"
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                    {hasVariants ? (
                      <>
                        <TableCell className="text-sm italic text-muted-foreground">Ver variantes</TableCell>
                        <TableCell className="text-sm italic text-muted-foreground">Por variante</TableCell>
                        <TableCell className="text-sm italic text-muted-foreground">Por variante</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-semibold">{a.stock}</TableCell>
                        <TableCell>
                          <select
                            value={row.motivo}
                            onChange={(e) => setRow(a.id, { motivo: e.target.value as Motivo })}
                            className="h-9 w-40 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          >
                            <option value="">Seleccionar...</option>
                            {MOTIVOS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={a.stock}
                            value={row.cantidad}
                            onChange={(e) => setRow(a.id, { cantidad: e.target.value })}
                            placeholder="0"
                            className={cn("h-9 w-24 focus-visible:ring-brand", over && "border-destructive")}
                          />
                        </TableCell>
                      </>
                    )}
                  </TableRow>

                  {hasVariants && isOpen && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={8} className="py-3">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                            Variantes — {a.name}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-8 text-navy">Variante</TableHead>
                                <TableHead className="h-8 text-navy">Stock Actual</TableHead>
                                <TableHead className="h-8 text-navy">Motivo</TableHead>
                                <TableHead className="h-8 text-navy">Cantidad</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {a.variants!.map((v) => {
                                const vs = a.variantStocks?.find((s) => s.variantId === v.id);
                                const stock = vs?.stock ?? 0;
                                const key = `${a.id}:${v.id}`;
                                const vrow = rows[key] ?? { motivo: "", cantidad: "" };
                                const vqty = Number(vrow.cantidad);
                                const vover = vqty > stock;
                                return (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-medium text-navy">{v.name}</TableCell>
                                    <TableCell className="font-semibold">{stock}</TableCell>
                                    <TableCell>
                                      <select
                                        value={vrow.motivo}
                                        onChange={(e) => setRow(key, { motivo: e.target.value as Motivo })}
                                        className="h-9 w-40 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                      >
                                        <option value="">Seleccionar...</option>
                                        {MOTIVOS.map((m) => (
                                          <option key={m} value={m}>{m}</option>
                                        ))}
                                      </select>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={stock}
                                        value={vrow.cantidad}
                                        onChange={(e) => setRow(key, { cantidad: e.target.value })}
                                        placeholder="0"
                                        className={cn("h-9 w-24 focus-visible:ring-brand", vover && "border-destructive")}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-navy">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              ¿Estás seguro que querés guardar la salida?
            </DialogTitle>
            <DialogDescription>
              Se aplicarán los siguientes movimientos. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-navy">Artículo / Variante</TableHead>
                  <TableHead className="text-navy">Motivo</TableHead>
                  <TableHead className="text-right text-navy">A retirar</TableHead>
                  <TableHead className="text-right text-navy">Stock resultante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((p) => {
                  const resulting = p.stock - p.cantidad;
                  return (
                    <TableRow key={p.key}>
                      <TableCell>
                        <div className="font-medium text-navy">{p.article.name}</div>
                        {p.variantName && (
                          <div className="text-xs text-muted-foreground">Variante: {p.variantName}</div>
                        )}
                        <div className="text-xs font-mono text-muted-foreground">{p.article.code}</div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600">
                          {p.motivo || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">−{p.cantidad}</TableCell>
                      <TableCell className="text-right font-semibold">{resulting}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="bg-navy text-navy-foreground hover:bg-navy/90">
              Confirmar Salida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function MiniBadge({
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
