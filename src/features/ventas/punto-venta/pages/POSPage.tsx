import { useEffect, useMemo, useRef, useState } from "react";
import { Barcode, Trash2, Eye, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { articles, discounts, formatCurrency, type Article, type Discount, type SaleItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArticleDetailsModal } from "@/components/modals/article-details-modal";
import { FinalizeSaleModal } from "@/components/pos/finalize-sale-modal";
import { SuccessModal } from "@/components/pos/success-modal";

type CartLine = SaleItem;

// Discount helper
function discountForArticle(a: Article): Discount | undefined {
  const active = discounts.filter((d) => d.active);
  const byCat = active.find((d) => d.type === "category" && d.categoryName === a.category);
  if (byCat) return byCat;
  const byCombo = active.find((d) => d.type === "combo" && d.comboItems?.some((c) => c.articleId === a.id));
  return byCombo;
}

export function POSPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ total: number; invoice?: string; cae?: string; email?: string } | null>(null);

  const [detailArticle, setDetailArticle] = useState<Article | undefined>();
  const [discountInfo, setDiscountInfo] = useState<{ discount: Discount; article: Article } | null>(null);

  // Responsive page size based on catalog container size
  const catalogRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const el = catalogRef.current;
    if (!el) return;
    const recompute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cardW = 200; // approx card min width incl gap
      const cardH = 150; // approx card height incl gap
      const cols = Math.max(2, Math.floor(w / cardW));
      const rows = Math.max(1, Math.floor(h / cardH));
      setPageSize(cols * rows);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return articles;
    return articles.filter((a) => `${a.code} ${a.name} ${a.category} ${a.brand}`.toLowerCase().includes(s));
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const totalUnits = cart.reduce((s, l) => s + l.quantity, 0);

  const addToCart = (a: Article) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.articleId === a.id);
      if (i >= 0) return prev.map((x, idx) => (idx === i ? { ...x, quantity: x.quantity + 1 } : x));
      return [...prev, { articleId: a.id, name: a.name, category: a.category, price: a.price / 100, quantity: 1, delivered: 0 }];
    });
  };

  const setQty = (id: string, q: number) =>
    setCart((prev) => prev.flatMap((l) => (l.articleId === id ? (q > 0 ? [{ ...l, quantity: q }] : []) : [l])));

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.articleId !== id));

  const handleConfirmed = (r: { paid: number; clientName: string; clientEmail?: string; afip: boolean; invoice?: { number: string; cae: string } }) => {
    setFinalizeOpen(false);
    setSuccessData({ total: subtotal, invoice: r.invoice?.number, cae: r.invoice?.cae, email: r.clientEmail });
    setSuccessOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-3 overflow-hidden">
      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
        {/* CART column (left) — includes search above */}
        <section className="flex min-h-0 flex-col gap-3">
          <div className="relative">
            <Barcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
            <Input
              autoFocus
              placeholder="Escanear código o buscar producto..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  addToCart(filtered[0]);
                  setQ("");
                }
              }}
              className="h-14 rounded-xl border-2 border-brand/30 bg-card pl-12 font-mono text-base focus-visible:border-brand"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_70px_110px_120px_40px] gap-2 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Producto</span>
              <span className="text-center">Cant.</span>
              <span className="text-right">P. Unit.</span>
              <span className="text-right">Subtotal</span>
              <span></span>
            </div>

            <div className="flex-1 overflow-auto">
              {cart.length === 0 && (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
                  Escaneá o agregá artículos del catálogo →
                </div>
              )}
              {cart.map((l) => (
                <div key={l.articleId} className="grid grid-cols-[1fr_70px_110px_120px_40px] items-center gap-2 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-navy">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.category}</div>
                  </div>
                  <div className="flex justify-center">
                    <Input
                      type="number" min={1} value={l.quantity}
                      onChange={(e) => setQty(l.articleId, Math.max(1, Number(e.target.value) || 1))}
                      className="h-7 w-14 border border-border text-center font-mono"
                    />
                  </div>
                  <div className="text-right font-mono text-xs text-muted-foreground">{formatCurrency(l.price)}</div>
                  <div className="text-right font-mono text-sm font-semibold text-navy">{formatCurrency(l.price * l.quantity)}</div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeLine(l.articleId)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <footer className="border-t border-border bg-muted/30 px-4 py-3">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Artículos en carrito</span>
                <span className="font-mono text-navy">{totalUnits} unid.</span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wide text-navy">Total</span>
                <span className="font-mono text-3xl font-bold text-brand">{formatCurrency(subtotal)}</span>
              </div>
              <Button
                disabled={cart.length === 0}
                onClick={() => setFinalizeOpen(true)}
                className="h-12 w-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
              >
                Cobrar {formatCurrency(subtotal)} →
              </Button>
            </footer>
          </div>
        </section>

        {/* CATALOG (right) */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
          <div ref={catalogRef} className="flex-1 overflow-hidden p-3">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
            >
              {slice.map((a) => {
                const stock = a.stock;
                const disc = discountForArticle(a);
                const finalPrice = disc ? (a.price / 100) * (1 - disc.percentage / 100) : a.price / 100;
                return (
                  <div
                    key={a.id}
                    onClick={() => stock > 0 && addToCart(a)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-brand hover:shadow-sm",
                      stock <= 0 && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        {a.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {disc && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDiscountInfo({ discount: disc, article: a }); }}
                            className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive hover:bg-destructive/20"
                            title="Ver descuento"
                          >
                            <Percent className="h-3 w-3" />
                            {disc.percentage}%
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailArticle(a); }}
                          className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-navy"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5 line-clamp-2 text-sm font-semibold text-navy">{a.name}</div>
                    <div className="mt-1">
                      {disc ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-lg font-bold text-brand">{formatCurrency(finalPrice)}</span>
                          <span className="font-mono text-xs text-muted-foreground line-through">{formatCurrency(a.price / 100)}</span>
                        </div>
                      ) : (
                        <div className="font-mono text-lg font-bold text-brand">{formatCurrency(a.price / 100)}</div>
                      )}
                    </div>
                    <div className="mt-auto pt-1.5">
                      <span className={cn(
                        "text-[11px] font-medium",
                        stock <= 0 ? "text-destructive" : stock <= a.safetyStock ? "text-amber-600" : "text-muted-foreground",
                      )}>
                        {stock <= 0 ? "Sin stock" : `${stock} unid.`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-border p-2">
            <SimplePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </section>
      </div>

      <ArticleDetailsModal open={!!detailArticle} onOpenChange={(o) => !o && setDetailArticle(undefined)} article={detailArticle} />

      <Dialog open={!!discountInfo} onOpenChange={(o) => !o && setDiscountInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">Descuento aplicado</DialogTitle>
          </DialogHeader>
          {discountInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-navy">{discountInfo.discount.name}</div>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {discountInfo.discount.type === "category" ? "Por categoría" : "Por combo"}
                  </Badge>
                </div>
                <div className="font-mono text-2xl font-bold text-destructive">-{discountInfo.discount.percentage}%</div>
              </div>
              <p className="text-sm text-muted-foreground">{discountInfo.discount.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border px-2 py-1.5">
                  <div className="text-muted-foreground">Desde</div>
                  <div className="font-mono text-navy">{discountInfo.discount.fromDate}</div>
                </div>
                <div className="rounded-md border border-border px-2 py-1.5">
                  <div className="text-muted-foreground">Hasta</div>
                  <div className="font-mono text-navy">{discountInfo.discount.toDate ?? "Sin límite"}</div>
                </div>
              </div>
              <div className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Precio original</span>
                  <span className="font-mono text-sm text-muted-foreground line-through">{formatCurrency(discountInfo.article.price / 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy">Precio con descuento</span>
                  <span className="font-mono text-xl font-bold text-brand">
                    {formatCurrency((discountInfo.article.price / 100) * (1 - discountInfo.discount.percentage / 100))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FinalizeSaleModal open={finalizeOpen} onOpenChange={setFinalizeOpen} total={subtotal} items={cart} onConfirm={handleConfirmed} />
      {successData && (
        <SuccessModal
          open={successOpen}
          onOpenChange={setSuccessOpen}
          total={successData.total}
          invoiceNumber={successData.invoice}
          cae={successData.cae}
          email={successData.email}
          onNewSale={() => setCart([])}
        />
      )}
    </div>
  );
}
