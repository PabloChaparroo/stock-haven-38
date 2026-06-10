import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2, Eye, Percent, ArrowRight, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { articles, discounts, formatCurrency, type Article, type Discount, type SaleItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArticleDetailsModal } from "@/components/modals/article-details-modal";
import { FinalizeSaleModal } from "@/components/pos/finalize-sale-modal";
import { SuccessModal } from "@/components/pos/success-modal";

type CartLine = SaleItem;

function discountForArticle(a: Article): Discount | undefined {
  const active = discounts.filter((d) => d.active);
  const byCat = active.find((d) => d.type === "category" && d.categoryName === a.category);
  if (byCat) return byCat;
  const byCombo = active.find((d) => d.type === "combo" && d.comboItems?.some((c) => c.articleId === a.id));
  return byCombo;
}

// Soft category palette (pure cosmetic)
const CATEGORY_TINTS: Record<string, string> = {
  Computadoras: "bg-emerald-50 text-emerald-700",
  Periféricos: "bg-blue-50 text-blue-700",
  Almacenamiento: "bg-amber-50 text-amber-700",
  Redes: "bg-purple-50 text-purple-700",
  Impresión: "bg-orange-50 text-orange-700",
};
const tintFor = (c: string) => CATEGORY_TINTS[c] ?? "bg-slate-100 text-slate-700";

export function POSPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ total: number; invoice?: string; cae?: string; email?: string } | null>(null);

  const [detailArticle, setDetailArticle] = useState<Article | undefined>();
  const [discountInfo, setDiscountInfo] = useState<{ discount: Discount; article: Article } | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const el = catalogRef.current;
    if (!el) return;
    const recompute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cardW = 210;
      const cardH = 170;
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
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-5 overflow-hidden">
      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
        <Input
          autoFocus
          placeholder="Escanear código o buscar producto..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) { addToCart(filtered[0]); setQ(""); }
          }}
          className="h-14 rounded-2xl border-2 border-brand/20 bg-card pl-12 text-base text-navy shadow-sm transition-all placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/10"
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        {/* CART */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_70px_110px_120px_40px] gap-2 border-b border-border bg-muted/40 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Producto</span>
            <span className="text-center">Cant.</span>
            <span className="text-right">P. Unit</span>
            <span className="text-right">Subtotal</span>
            <span></span>
          </div>

          <div className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-12 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Escaneá o agregá artículos del catálogo</p>
              </div>
            ) : (
              cart.map((l) => (
                <div key={l.articleId} className="grid grid-cols-[1fr_70px_110px_120px_40px] items-center gap-2 border-b border-border/60 px-6 py-3 transition-colors hover:bg-muted/30">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-navy">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.category}</div>
                  </div>
                  <div className="flex justify-center">
                    <Input
                      type="number" min={1} value={l.quantity}
                      onChange={(e) => setQty(l.articleId, Math.max(1, Number(e.target.value) || 1))}
                      className="h-8 w-14 rounded-lg border border-border text-center font-mono text-sm"
                    />
                  </div>
                  <div className="text-right font-mono text-xs text-muted-foreground">{formatCurrency(l.price)}</div>
                  <div className="text-right font-mono text-sm font-bold text-navy">{formatCurrency(l.price * l.quantity)}</div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeLine(l.articleId)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border bg-card px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Artículos en carrito</span>
              <span className="font-semibold text-navy">{totalUnits} unid.</span>
            </div>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-bold uppercase tracking-wide text-navy">Total</span>
              <span className="font-mono text-4xl font-black text-brand">{formatCurrency(subtotal)}</span>
            </div>
            <Button
              disabled={cart.length === 0}
              onClick={() => setFinalizeOpen(true)}
              className="h-14 w-full gap-2 rounded-2xl bg-brand text-base font-bold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 active:scale-[0.99]"
            >
              Cobrar {formatCurrency(subtotal)}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </footer>
        </section>

        {/* CATALOG */}
        <section className="flex min-h-0 flex-col gap-3">
          <div ref={catalogRef} className="flex-1 overflow-hidden">
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
              {slice.map((a) => {
                const stock = a.stock;
                const disc = discountForArticle(a);
                const finalPrice = disc ? (a.price / 100) * (1 - disc.percentage / 100) : a.price / 100;
                const lowStock = stock > 0 && stock <= a.safetyStock;
                return (
                  <div
                    key={a.id}
                    onClick={() => stock > 0 && addToCart(a)}
                    className={cn(
                      "group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md",
                      stock <= 0 && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={cn("rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide", tintFor(a.category))}>
                        {a.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {disc && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDiscountInfo({ discount: disc, article: a }); }}
                            className="inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-bold text-destructive transition-colors hover:bg-destructive/10"
                            title="Ver descuento"
                          >
                            <Percent className="h-3 w-3" />{disc.percentage}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailArticle(a); }}
                          className="text-muted-foreground/60 transition-colors hover:text-brand"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mb-1 truncate text-sm font-semibold text-navy">{a.name}</h3>
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-brand">{formatCurrency(finalPrice)}</span>
                      {disc && (
                        <span className="font-mono text-xs text-muted-foreground line-through">{formatCurrency(a.price / 100)}</span>
                      )}
                    </div>
                    <div className={cn(
                      "mt-auto text-[11px] font-semibold",
                      stock <= 0 ? "text-destructive" : lowStock ? "text-amber-600" : "text-muted-foreground",
                    )}>
                      {stock <= 0 ? "Sin stock" : `${stock} unid.`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-sm font-bold transition-colors",
                    n === safePage
                      ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
