import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Boxes, History, MapPin, Package, Percent, ScanBarcode } from "lucide-react";
import { discounts, priceLists, formatCurrency, type Article, type Discount } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function discountsForArticle(a: Article): Discount[] {
  const active = discounts.filter((d) => d.active);
  return active.filter((d) => {
    if (d.type === "category") return d.categoryName === a.category;
    if (d.type === "list" && d.listId) {
      const list = priceLists.find((l) => l.id === d.listId);
      return !!list && list.articleIds.includes(a.id);
    }
    return false;
  });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article;
};

export function ArticleDetailsModal({ open, onOpenChange, article }: Props) {
  if (!article) return null;

  const hasVariants = !!article.variants && article.variants.length > 0;
  const variantStockTotal = hasVariants
    ? (article.variantStocks ?? []).reduce((s, v) => s + (v.stock ?? 0), 0)
    : 0;
  const globalStock = hasVariants ? variantStockTotal : article.stock;
  const lowStock = !hasVariants && article.stock < article.safetyStock;
  const appliedDiscounts = discountsForArticle(article);


  // Mock data not present in the Article type — safe defaults for display.
  const barcode = `7791${article.code.padStart(9, "0")}`;
  const location = `Pasillo ${(parseInt(article.id, 10) % 6) + 1} - Estante ${String.fromCharCode(
    65 + (parseInt(article.id, 10) % 5),
  )}`;
  const isActive = true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {/* Cabecera — intacta visualmente, sólo se ajusta el ancho del modal */}
        <div className="bg-header-gradient px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-navy/10 text-navy">
                {article.code}
              </Badge>
              <Badge className="bg-brand text-brand-foreground">{article.category}</Badge>
            </div>
            <DialogTitle className="mt-2 text-2xl text-navy">{article.name}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[180px_1fr]">
          <div className="grid h-44 w-44 place-items-center overflow-hidden rounded-2xl border bg-muted/40">
            <img src={article.image} alt={article.name} className="max-h-full max-w-full object-contain" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Marca" value={article.brand} />
            <Field label="Abreviatura" value={article.abbreviation} />
            <Field label="Precio" value={formatCurrency(article.price)} />
            <Field label="Creación" value={article.createdAt} />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Stock global
              </div>
              <div className={cn("text-lg font-semibold", lowStock ? "text-destructive" : "text-navy")}>
                {globalStock}
              </div>
            </div>
            <Field label="Stock de seguridad" value={String(article.safetyStock)} />

            {discount && (
              <div className="col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-destructive/15 text-destructive">
                      <Percent className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-navy">{discount.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {discount.type === "category" ? "Por categoría" : "Por combo"} · Vigencia: {discount.fromDate} → {discount.toDate ?? "sin límite"}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xl font-bold text-destructive">-{discount.percentage}%</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-destructive/20 pt-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Precio final con descuento</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground line-through">{formatCurrency(article.price)}</span>
                    <span className="font-mono text-lg font-bold text-brand">
                      {formatCurrency(article.price * (1 - discount.percentage / 100))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        <Separator />

        {/* Tabs */}
        <div className="px-6 pb-6 pt-4">
          <Tabs defaultValue="detalles" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/60">
              <TabsTrigger value="detalles">Detalles Generales</TabsTrigger>
              <TabsTrigger value="variantes">Variantes y Stock</TabsTrigger>
              <TabsTrigger value="logistica">Logística</TabsTrigger>
            </TabsList>

            {/* Detalles Generales */}
            <TabsContent value="detalles" className="mt-4 space-y-5">
              <p className="text-sm leading-relaxed text-foreground">{article.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetaCard
                  icon={<ScanBarcode className="h-4 w-4 text-brand" />}
                  label="Código de Barras / SKU"
                  value={`EAN: ${barcode}`}
                />
                <MetaCard
                  icon={<MapPin className="h-4 w-4 text-brand" />}
                  label="Ubicación Física"
                  value={location}
                />
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Estado en Sistema
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Discontinuado
                    </span>
                  )}
                </div>
                <MetaCard
                  icon={<Package className="h-4 w-4 text-brand" />}
                  label="Categoría"
                  value={article.category}
                />
              </div>
            </TabsContent>

            {/* Variantes y Stock */}
            <TabsContent value="variantes" className="mt-4 space-y-4">
              {hasVariants ? (
                <>
                  <div className="rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Stock Total Disponible: </span>
                    <span className="font-semibold text-navy">{variantStockTotal} unidades</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      (sumatoria de variantes − reservas)
                    </span>
                  </div>

                  <div className="grid gap-2.5">
                    {article.variants!.map((v) => {
                      const vs = article.variantStocks?.find((s) => s.variantId === v.id);
                      const stock = vs?.stock ?? 0;
                      const safety = vs?.safetyStock ?? 0;
                      const vlow = safety > 0 && stock < safety;
                      return (
                        <div
                          key={v.id}
                          className="rounded-lg border bg-card p-3 transition hover:border-brand/40"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[11px]">
                                {v.code}
                              </Badge>
                              <span className="font-medium text-navy">{v.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{v.description}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Pill
                              tone={vlow ? "red" : "navy"}
                              label="Stock"
                              value={String(stock)}
                            />
                            <Pill tone="muted" label="Punto de Reposición / Seg." value={String(safety)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Stock Actual
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-2xl font-bold",
                        lowStock ? "text-destructive" : "text-navy",
                      )}
                    >
                      {article.stock}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Stock de Seguridad
                    </div>
                    <div className="mt-1 text-2xl font-bold text-navy">{article.safetyStock}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Logística */}
            <TabsContent value="logistica" className="mt-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acciones del ciclo de vida
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" className="gap-2 border-border/70">
                    <Boxes className="h-4 w-4" />
                    Ver Proveedores Asignados
                  </Button>
                  <Button variant="outline" className="gap-2 border-border/70" disabled title="Próximamente">
                    <History className="h-4 w-4" />
                    Ver Historial de Auditoría
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-navy">{value}</div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-sm font-medium text-navy">{value}</div>
    </div>
  );
}

function Pill({
  tone,
  label,
  value,
}: {
  tone: "navy" | "red" | "muted";
  label: string;
  value: string;
}) {
  const styles =
    tone === "red"
      ? "bg-red-100 text-red-700"
      : tone === "navy"
        ? "bg-navy/10 text-navy"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", styles)}>
      <span className="opacity-70">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
