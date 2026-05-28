import { useMemo, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { articles, categories, type DiscountType, type Discount } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  discount?: Discount;
  defaultType?: DiscountType;
};

type LocalCombo = { articleId: string; variantId?: string; minQuantity: number };

const PAGE_SIZE = 12;

export function DiscountFormModal({ open, onOpenChange, mode = "create", discount, defaultType }: Props) {
  const [type, setType] = useState<DiscountType>(discount?.type ?? defaultType ?? "category");
  const [combo, setCombo] = useState<LocalCombo[]>(discount?.comboItems ?? []);
  const [pickArticle, setPickArticle] = useState<string>("");
  const [pickVariant, setPickVariant] = useState<string>("");
  const [pickQty, setPickQty] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return articles;
    return articles.filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s));
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pickedArt = articles.find((a) => a.id === pickArticle);
  const variantsAvailable = pickedArt?.variants ?? [];

  const addCombo = () => {
    if (!pickArticle) return;
    if (variantsAvailable.length > 0 && !pickVariant) return;
    setCombo((c) => [
      ...c.filter((x) => !(x.articleId === pickArticle && x.variantId === (pickVariant || undefined))),
      { articleId: pickArticle, variantId: pickVariant || undefined, minQuantity: pickQty },
    ]);
    setPickArticle(""); setPickVariant(""); setPickQty(1);
  };

  const removeCombo = (idx: number) => setCombo((c) => c.filter((_, i) => i !== idx));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-navy">
            {mode === "create" ? "Nuevo descuento" : "Editar descuento"}
          </DialogTitle>
          <DialogDescription>
            Configurá las condiciones del descuento. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onOpenChange(false); }}>
          <div className="space-y-1.5">
            <Label>Tipo de descuento *</Label>
            <Select value={type} onValueChange={(v) => setType(v as DiscountType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Por Categoría</SelectItem>
                <SelectItem value="combo">Por Combo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Nombre *</Label>
              <Input defaultValue={discount?.name} placeholder="Ej: Promo Verano" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Descripción</Label>
              <Textarea defaultValue={discount?.description} rows={2} placeholder="Breve descripción" />
            </div>
            <div className="space-y-1.5">
              <Label>Porcentaje (%) *</Label>
              <Input type="number" min={1} max={100} defaultValue={discount?.percentage} placeholder="15" />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha desde *</Label>
              <Input type="date" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Fecha hasta (opcional)</Label>
              <Input type="date" />
            </div>
          </section>

          <Separator />

          {type === "category" ? (
            <div className="space-y-1.5">
              <Label>Categoría a aplicar *</Label>
              <Select defaultValue={discount?.categoryName}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border bg-card p-4">
              <h4 className="font-semibold text-navy">Artículos del combo</h4>

              {/* Picker with paginated list */}
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar artículo por nombre o código..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-44 rounded-md border bg-card">
                  <ul className="divide-y">
                    {slice.map((a) => (
                      <li
                        key={a.id}
                        onClick={() => { setPickArticle(a.id); setPickVariant(""); }}
                        className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-muted ${pickArticle === a.id ? "bg-brand/10" : ""}`}
                      >
                        <span className="font-medium text-navy">{a.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

                <div className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
                  {variantsAvailable.length > 0 ? (
                    <Select value={pickVariant} onValueChange={setPickVariant}>
                      <SelectTrigger><SelectValue placeholder="Elegí la variante *" /></SelectTrigger>
                      <SelectContent>
                        {variantsAvailable.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.code} — {v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="grid h-9 items-center rounded-md border border-dashed bg-muted/30 px-3 text-xs text-muted-foreground">
                      {pickedArt ? "Sin variantes — se aplica al artículo" : "Seleccioná un artículo"}
                    </div>
                  )}
                  <Input
                    type="number" min={1} value={pickQty}
                    onChange={(e) => setPickQty(parseInt(e.target.value) || 1)}
                    placeholder="Cant. mín."
                  />
                  <Button
                    type="button" onClick={addCombo}
                    disabled={!pickArticle || (variantsAvailable.length > 0 && !pickVariant)}
                    className="bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Añadir
                  </Button>
                </div>
              </div>

              {combo.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no agregaste artículos al combo.</p>
              ) : (
                <div className="space-y-2">
                  {combo.map((item, idx) => {
                    const art = articles.find((a) => a.id === item.articleId);
                    if (!art) return null;
                    const variant = item.variantId ? art.variants?.find((v) => v.id === item.variantId) : undefined;
                    return (
                      <div key={`${item.articleId}-${item.variantId ?? ""}-${idx}`} className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground">{art.code}</span>
                        <span className="flex-1 font-medium text-navy">
                          {art.name}
                          {variant && (
                            <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                              {variant.code} · {variant.name}
                            </span>
                          )}
                        </span>
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                          Mín: {item.minQuantity}
                        </span>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removeCombo(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
