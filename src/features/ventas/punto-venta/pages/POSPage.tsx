import { useMemo, useState } from "react";
import { Barcode, ShoppingCart, FolderOpen, Trash2, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { articles, formatCurrency, type Article, type SaleItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { LoadOrderModal } from "@/components/pos/load-order-modal";
import { FinalizeSaleModal } from "@/components/pos/finalize-sale-modal";
import { SuccessModal } from "@/components/pos/success-modal";

type CartLine = SaleItem;
const PAGE = 12;

export function POSPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [loadOpen, setLoadOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ total: number; invoice?: string; cae?: string; email?: string } | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return articles;
    return articles.filter((a) => `${a.code} ${a.name} ${a.category} ${a.brand}`.toLowerCase().includes(s));
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);

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
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3">
      <div className="relative">
        <Barcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
        <Input
          autoFocus
          placeholder="Escanear código de barras o buscar producto... (Enter para añadir)"
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

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[35fr_65fr]">
        {/* CART */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <ShoppingCart className="h-4 w-4 text-brand" />
              CARRITO — {cart.length} ARTÍCULO{cart.length !== 1 && "S"}
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setLoadOpen(true)}>
                <FolderOpen className="h-3.5 w-3.5" /> Cargar Pedido
              </Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setCart([])}>
                <Trash2 className="h-3.5 w-3.5" /> Limpiar
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Producto</span><span>Cant.</span><span>P. Unit.</span><span>Subtotal</span><span></span>
          </div>

          <div className="flex-1 overflow-auto">
            {cart.length === 0 && (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
                Escaneá o agregá artículos del catálogo →
              </div>
            )}
            {cart.map((l) => (
              <div key={l.articleId} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-navy">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.category}</div>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-border px-1">
                  <Input
                    type="number" min={1} value={l.quantity}
                    onChange={(e) => setQty(l.articleId, Math.max(1, Number(e.target.value) || 1))}
                    className="h-7 w-12 border-0 text-center font-mono shadow-none"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                </div>
                <div className="w-20 text-right font-mono text-xs text-muted-foreground">{formatCurrency(l.price)}</div>
                <div className="w-24 text-right font-mono text-sm font-semibold text-navy">{formatCurrency(l.price * l.quantity)}</div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeLine(l.articleId)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <footer className="border-t border-border bg-muted/30 px-4 py-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono text-navy">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mb-3 flex justify-between text-xs">
              <span className="text-muted-foreground">IVA 21%</span>
              <span className="text-muted-foreground">Incluido</span>
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
        </section>

        {/* CATALOG */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold text-navy">
            <span>🔍 CATÁLOGO — {filtered.length} PRODUCTOS</span>
          </header>
          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
              {slice.map((a) => {
                const stock = a.stock;
                const low = stock <= 0 ? "out" : stock <= a.safetyStock ? "low" : "ok";
                return (
                  <button
                    key={a.id}
                    onClick={() => stock > 0 && addToCart(a)}
                    disabled={stock <= 0}
                    className="group flex flex-col rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-brand hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-block self-start rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      {a.category}
                    </span>
                    <div className="mt-1.5 line-clamp-2 text-sm font-semibold text-navy">{a.name}</div>
                    <div className="mt-1 font-mono text-lg font-bold text-brand">{formatCurrency(a.price / 100)}</div>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-medium",
                          low === "ok" && "text-muted-foreground",
                          low === "low" && "text-amber-600",
                          low === "out" && "text-destructive",
                        )}
                      >
                        {low !== "ok" && <AlertTriangle className="h-3 w-3" />}
                        {low === "out" ? "Sin stock" : low === "low" ? `Bajo stock: ${stock} unid.` : `${stock} unid.`}
                      </span>
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-brand-foreground transition group-hover:scale-110 group-disabled:bg-muted group-disabled:text-muted-foreground">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </section>
      </div>

      <LoadOrderModal
        open={loadOpen}
        onOpenChange={setLoadOpen}
        onLoad={(o) => setCart(o.items.map((i) => ({ ...i, delivered: 0 })))}
      />
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
