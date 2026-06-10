import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2, Eye, ArrowRight, ShoppingCart, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { articles, categories, discounts, priceLists, formatCurrency, type Article, type Discount, type SaleItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArticleDetailsModal } from "@/components/modals/article-details-modal";
import { ImageZoomModal } from "@/components/modals/image-zoom-modal";
import { FinalizeSaleModal } from "@/components/pos/finalize-sale-modal";
import { SuccessModal } from "@/components/pos/success-modal";

type CartLine = SaleItem;

export function discountForArticle(a: Article): Discount | undefined {
  const active = discounts.filter((d) => d.active);
  const byCat = active.find((d) => d.type === "category" && d.categoryName === a.category);
  if (byCat) return byCat;
  return active.find((d) => {
    if (d.type !== "list" || !d.listId) return false;
    const list = priceLists.find((l) => l.id === d.listId);
    return !!list && list.articleIds.includes(a.id);
  });
}

export function POSPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ total: number; invoice?: string; cae?: string; remito?: string; email?: string } | null>(null);

  const [detailArticle, setDetailArticle] = useState<Article | undefined>();
  const [zoomImg, setZoomImg] = useState<{ src: string; alt: string } | null>(null);
  const [discountInfo, setDiscountInfo] = useState<{ article: Article; discount: Discount } | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const el = catalogRef.current;
    if (!el) return;
    const recompute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cardW = 200;
      const cardH = 140;
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
    return articles.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (!s) return true;
      return `${a.code} ${a.name} ${a.category} ${a.brand}`.toLowerCase().includes(s);
    });
  }, [q, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const totalUnits = cart.reduce((s, l) => s + l.quantity, 0);

  const addToCart = (a: Article) => {
    const disc = discountForArticle(a);
    const unitPrice = disc ? (a.price / 100) * (1 - disc.percentage / 100) : a.price / 100;
    setCart((prev) => {
      const i = prev.findIndex((x) => x.articleId === a.id);
      if (i >= 0) return prev.map((x, idx) => (idx === i ? { ...x, quantity: x.quantity + 1 } : x));
      return [...prev, { articleId: a.id, name: a.name, category: a.category, price: unitPrice, quantity: 1, delivered: 0 }];
    });
  };

  const setQty = (id: string, qty: number) =>
    setCart((prev) => prev.flatMap((l) => (l.articleId === id ? (qty > 0 ? [{ ...l, quantity: qty }] : []) : [l])));

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.articleId !== id));

  const handleConfirmed = (r: { paid: number; clientName: string; clientEmail?: string; afip: boolean; invoice?: { number: string; cae: string }; remito?: { number: string; kind: "Total" | "Parcial" } }) => {
    setFinalizeOpen(false);
    setSuccessData({ total: subtotal, invoice: r.invoice?.number, cae: r.invoice?.cae, remito: r.remito?.number, email: r.clientEmail });
    setSuccessOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-5 overflow-hidden">
      <div className="flex gap-3">
        <div className="relative flex-1">
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
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="h-14 w-56 rounded-2xl border-2 border-brand/20 bg-card text-navy shadow-sm focus:border-brand focus:ring-4 focus:ring-brand/10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        {/* CART */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
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
              cart.map((l) => {
                const art = articles.find((a) => a.id === l.articleId);
                const disc = art ? discountForArticle(art) : undefined;
                return (
                <div key={l.articleId} className="grid grid-cols-[1fr_70px_110px_120px_40px] items-center gap-2 border-b border-border/60 px-6 py-3 transition-colors hover:bg-muted/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-navy">{l.name}</span>
                      {disc && (
                        <button
                          type="button"
                          onClick={() => art && setDiscountInfo({ article: art, discount: disc })}
                          className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive hover:bg-destructive/20"
                          title="Ver descuento"
                        >
                          -{disc.percentage}%
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{l.category}</div>
                  </div>
                  <div className="flex justify-center">
                    <Input
                      type="number" min={1} value={l.quantity}
                      onChange={(e) => setQty(l.articleId, Math.max(1, Number(e.target.value) || 1))}
                      className="h-8 w-14 rounded-lg border border-border text-center font-mono text-sm"
                    />
                  </div>
                  <div className="text-right font-mono text-xs">
                    {disc && art && (
                      <div className="text-[10px] text-muted-foreground line-through">{formatCurrency(art.price / 100)}</div>
                    )}
                    <div className={cn(disc ? "font-semibold text-brand" : "text-muted-foreground")}>{formatCurrency(l.price)}</div>
                  </div>
                  <div className="text-right font-mono text-sm font-bold text-navy">{formatCurrency(l.price * l.quantity)}</div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeLine(l.articleId)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                );
              })
            )}
          </div>

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
                const lowStock = stock > 0 && stock <= a.safetyStock;
                return (
                  <div
                    key={a.id}
                    onClick={() => stock > 0 && addToCart(a)}
                    className={cn(
                      "group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md",
                      stock <= 0 && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {a.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailArticle(a); }}
                        className="text-muted-foreground/60 transition-colors hover:text-brand"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-navy">{a.name}</h3>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <span className={cn(
                        "text-[11px] font-semibold",
                        stock <= 0 ? "text-destructive" : lowStock ? "text-amber-600" : "text-muted-foreground",
                      )}>
                        {stock <= 0 ? "Sin stock" : `${stock} unid.`}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (a.image) setZoomImg({ src: a.image, alt: a.name }); }}
                        className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/40 transition hover:border-brand"
                        title="Ver imagen"
                      >
                        {a.image ? (
                          <img src={a.image} alt={a.name} className="h-full w-full object-contain" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          <SimplePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>

      <ArticleDetailsModal open={!!detailArticle} onOpenChange={(o) => !o && setDetailArticle(undefined)} article={detailArticle} />
      <ImageZoomModal open={!!zoomImg} onOpenChange={(o) => !o && setZoomImg(null)} src={zoomImg?.src} alt={zoomImg?.alt} />

      <Dialog open={!!discountInfo} onOpenChange={(o) => !o && setDiscountInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{discountInfo?.discount.name}</DialogTitle>
            <DialogDescription>
              Descuento del {discountInfo?.discount.percentage}% {discountInfo?.discount.type === "category" ? `en categoría ${discountInfo?.discount.categoryName}` : "por lista"}
            </DialogDescription>
          </DialogHeader>
          {discountInfo && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Vigencia</span>
                <span className="font-medium">{discountInfo.discount.fromDate}{discountInfo.discount.toDate ? ` → ${discountInfo.discount.toDate}` : ""}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-muted-foreground">Precio original</span>
                <span className="font-mono line-through">{formatCurrency(discountInfo.article.price)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 px-3 py-2">
                <span className="font-semibold text-navy">Precio con descuento</span>
                <span className="font-mono text-lg font-bold text-brand">
                  {formatCurrency(discountInfo.article.price * (1 - discountInfo.discount.percentage / 100))}
                </span>
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
          remitoNumber={successData.remito}
          email={successData.email}
          onNewSale={() => setCart([])}
        />
      )}
    </div>
  );
}
