import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Search, Trash2, Star, Eye, Pencil, Package, Truck, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { articles as allArticles, suppliers as allSuppliers, formatCurrency, type Article, type Supplier } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

type DraftItem = {
  articleId: string;
  code: string;
  name: string;
  supplierId: string;
  supplierName: string;
  stock: number;
  safetyStock: number;
  unitPrice: number;
  quantity: number;
};

// ---- synthetic mappings (mock) ----
function suppliersForArticle(articleId: string): Supplier[] {
  const n = Number(articleId);
  const count = 2 + (n % 3);
  const out: Supplier[] = [];
  for (let i = 0; i < count; i++) {
    const sup = allSuppliers[(n * 2 + i * 3) % allSuppliers.length];
    if (!out.find((s) => s.id === sup.id)) out.push(sup);
  }
  return out;
}
function articlesForSupplier(supplierId: string): Article[] {
  const n = Number(supplierId);
  return allArticles.filter((_, i) => (i + n) % 3 !== 0).slice(0, 14);
}
function pricingFor(articleId: string, supplierId: string) {
  const aN = Number(articleId);
  const sN = Number(supplierId);
  const a = allArticles.find((x) => x.id === articleId)!;
  const offset = ((sN * 7) % 11) - 5;
  const unit = Math.max(100, Math.round((a.price / 100) * (1 + offset / 100) / 100) * 100);
  const delivery = 2 + ((aN + sN) % 12);
  return { unitPrice: unit, deliveryDays: delivery };
}

export function OrderFormModal({ open, onOpenChange }: Props) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);

  // sub-modals
  const [articleForSuppliers, setArticleForSuppliers] = useState<Article | null>(null);
  const [supplierCatalog, setSupplierCatalog] = useState<Supplier | null>(null);
  const [preselectedArticleId, setPreselectedArticleId] = useState<string | null>(null);

  const articleResults = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return allArticles.filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s)).slice(0, 5);
  }, [search]);

  const supplierResults = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return allSuppliers.filter((su) => su.name.toLowerCase().includes(s) || su.code.toLowerCase().includes(s)).slice(0, 5);
  }, [search]);

  const showDropdown = (articleResults.length + supplierResults.length) > 0;

  // group by supplier
  const draftsBySupplier = useMemo(() => {
    const m = new Map<string, { supplier: { id: string; name: string }; items: DraftItem[]; total: number }>();
    for (const it of items) {
      const cur = m.get(it.supplierId) ?? { supplier: { id: it.supplierId, name: it.supplierName }, items: [], total: 0 };
      cur.items.push(it);
      cur.total += it.unitPrice * it.quantity;
      m.set(it.supplierId, cur);
    }
    return Array.from(m.values());
  }, [items]);

  const grandTotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  const handleRemove = (articleId: string, supplierId: string) =>
    setItems((p) => p.filter((it) => !(it.articleId === articleId && it.supplierId === supplierId)));

  const handleQty = (articleId: string, supplierId: string, qty: number) =>
    setItems((p) => p.map((it) => (it.articleId === articleId && it.supplierId === supplierId ? { ...it, quantity: Math.max(1, qty) } : it)));

  const addFromCatalog = (supplier: Supplier, selectedIds: string[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const aid of selectedIds) {
        const exists = next.find((it) => it.articleId === aid && it.supplierId === supplier.id);
        if (exists) continue;
        const a = allArticles.find((x) => x.id === aid)!;
        const { unitPrice } = pricingFor(aid, supplier.id);
        next.push({
          articleId: a.id,
          code: a.code,
          name: a.name,
          supplierId: supplier.id,
          supplierName: supplier.name,
          stock: a.stock,
          safetyStock: a.safetyStock,
          unitPrice,
          quantity: 1,
        });
      }
      return next;
    });
  };

  const reset = () => {
    setItems([]);
    setSearch("");
  };

  const handleGenerate = () => {
    if (draftsBySupplier.length === 0) return toast.error("Agregá al menos un artículo");
    toast.success(`${draftsBySupplier.length} órdenes de compra generadas`);
    reset();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
        <DialogContent className="max-h-[94vh] max-w-[1200px] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-navy">Nueva Orden de Compra</DialogTitle>
                <DialogDescription>Buscá por artículo o proveedor para construir borradores agrupados.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Smart search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍  Buscar artículo o proveedor para agregar a las órdenes..."
              className="h-12 rounded-xl pl-12 text-base"
            />
            {showDropdown && (
              <div className="absolute z-20 mt-1 max-h-[360px] w-full overflow-auto rounded-xl border bg-popover shadow-lg">
                {articleResults.length > 0 && (
                  <div>
                    <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Artículos</div>
                    {articleResults.map((a) => (
                      <button
                        key={`a-${a.id}`}
                        type="button"
                        onClick={() => { setArticleForSuppliers(a); setSearch(""); }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                      >
                        <Package className="h-4 w-4 text-brand" />
                        <span className="flex-1 font-medium text-navy">{a.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                      </button>
                    ))}
                  </div>
                )}
                {supplierResults.length > 0 && (
                  <div>
                    <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Proveedores</div>
                    {supplierResults.map((su) => (
                      <button
                        key={`s-${su.id}`}
                        type="button"
                        onClick={() => { setSupplierCatalog(su); setSearch(""); }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                      >
                        <Truck className="h-4 w-4 text-navy" />
                        <span className="flex-1 font-medium text-navy">{su.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{su.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Two-column layout */}
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            {/* LEFT — consolidated items */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy">Artículos a Pedir</h3>
                <span className="text-xs text-muted-foreground">{items.length} ítem(s)</span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-3 py-12 text-center">
                  <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Busca un artículo o proveedor para comenzar</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Artículo</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="text-center">Seg.</TableHead>
                        <TableHead className="w-24 text-center">Cant.</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it) => {
                        const low = it.stock <= it.safetyStock;
                        return (
                          <TableRow key={`${it.articleId}-${it.supplierId}`}>
                            <TableCell>
                              <div className="font-medium text-navy">{it.name}</div>
                              <div className="font-mono text-[11px] text-muted-foreground">{it.code}</div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{it.supplierName}</TableCell>
                            <TableCell className={cn("text-center font-mono text-sm", low ? "text-destructive font-semibold" : "")}>{it.stock}</TableCell>
                            <TableCell className="text-center font-mono text-sm text-muted-foreground">{it.safetyStock}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={it.quantity}
                                onChange={(e) => handleQty(it.articleId, it.supplierId, Number(e.target.value) || 1)}
                                className="h-8 text-center"
                              />
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(it.unitPrice)}</TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(it.unitPrice * it.quantity)}</TableCell>
                            <TableCell>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemove(it.articleId, it.supplierId)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* RIGHT — drafts by supplier */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy">Borradores de Órdenes Generadas</h3>
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">{draftsBySupplier.length}</span>
              </div>

              {draftsBySupplier.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-3 py-12 text-center">
                  <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Sin borradores todavía</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {draftsBySupplier.map((d) => (
                    <div key={d.supplier.id} className="rounded-xl border bg-card p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-navy">{d.supplier.name}</div>
                          <div className="text-[11px] text-muted-foreground">{d.items.length} artículo(s)</div>
                        </div>
                        <span className="font-mono text-sm font-bold text-brand">{formatCurrency(d.total)}</span>
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => {
                          const sup = allSuppliers.find((s) => s.id === d.supplier.id)!;
                          toast.info(`${d.items.length} artículo(s) en el borrador de ${sup.name}`);
                        }}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> Ver Artículos
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => {
                          const sup = allSuppliers.find((s) => s.id === d.supplier.id)!;
                          setSupplierCatalog(sup);
                        }}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total General</span>
                  <span className="font-mono text-xl font-bold text-navy">{formatCurrency(grandTotal)}</span>
                </div>
                <Button
                  className="mt-3 h-11 w-full bg-navy text-base font-semibold text-navy-foreground hover:bg-navy/90"
                  disabled={draftsBySupplier.length === 0}
                  onClick={handleGenerate}
                >
                  Generar {draftsBySupplier.length} Órden{draftsBySupplier.length === 1 ? "" : "es"} de Compra
                </Button>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL A — suppliers for an article */}
      <ArticleSuppliersModal
        article={articleForSuppliers}
        onClose={() => setArticleForSuppliers(null)}
        onSelectSupplier={(sup) => {
          setArticleForSuppliers(null);
          setSupplierCatalog(sup);
        }}
      />

      {/* MODAL B — catalog of a supplier */}
      <SupplierCatalogModal
        supplier={supplierCatalog}
        existing={items}
        onClose={() => setSupplierCatalog(null)}
        onSave={(sup, ids) => {
          addFromCatalog(sup, ids);
          setSupplierCatalog(null);
          toast.success(`${ids.length} artículo(s) agregados desde ${sup.name}`);
        }}
      />
    </>
  );
}

// ===================== MODAL A =====================

function ArticleSuppliersModal({
  article,
  onClose,
  onSelectSupplier,
}: {
  article: Article | null;
  onClose: () => void;
  onSelectSupplier: (s: Supplier) => void;
}) {
  if (!article) return null;
  const list = suppliersForArticle(article.id);

  return (
    <Dialog open={!!article} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-navy">Proveedores disponibles para {article.name}</DialogTitle>
          <DialogDescription>Elegí el proveedor con el que querés cargar este artículo.</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Proveedor</TableHead>
                <TableHead>Reputación</TableHead>
                <TableHead className="text-center">Tiempo Entrega</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((sup) => {
                const { unitPrice, deliveryDays } = pricingFor(article.id, sup.id);
                return (
                  <TableRow key={sup.id}>
                    <TableCell className="font-medium text-navy">{sup.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={cn("h-4 w-4", n <= sup.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {deliveryDays} días
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(unitPrice)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={() => onSelectSupplier(sup)}>
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== MODAL B =====================

function SupplierCatalogModal({
  supplier,
  existing,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  existing: DraftItem[];
  onClose: () => void;
  onSave: (s: Supplier, ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  // reset on open
  const openKey = supplier?.id ?? "";
  // simple reset via useMemo trick
  useMemo(() => {
    setSelected(new Set());
    setQ("");
  }, [openKey]);

  if (!supplier) return null;
  const catalog = articlesForSupplier(supplier.id);
  const filtered = catalog.filter((a) => {
    const s = q.trim().toLowerCase();
    return !s || a.name.toLowerCase().includes(s) || a.code.includes(s);
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <Dialog open={!!supplier} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">Catálogo del Proveedor: {supplier.name}</DialogTitle>
          <DialogDescription>Marcá los artículos que querés agregar al borrador.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en catálogo..." className="h-9 pl-9" />
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10" />
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Tiempo Entrega</TableHead>
                <TableHead className="text-right">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const { unitPrice, deliveryDays } = pricingFor(a.id, supplier.id);
                const already = existing.some((it) => it.articleId === a.id && it.supplierId === supplier.id);
                return (
                  <TableRow key={a.id} className={already ? "opacity-60" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(a.id) || already}
                        disabled={already}
                        onCheckedChange={() => toggle(a.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-navy">{a.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{a.code}{already ? " · ya agregado" : ""}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {deliveryDays} días
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(unitPrice)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{selected.size} artículo(s) seleccionado(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              className="bg-navy text-navy-foreground hover:bg-navy/90"
              disabled={selected.size === 0}
              onClick={() => onSave(supplier, Array.from(selected))}
            >
              Guardar Selección
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
