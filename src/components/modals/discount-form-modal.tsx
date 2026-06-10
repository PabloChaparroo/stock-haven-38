import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { articles, categories, type DiscountType, type Discount } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  discount?: Discount;
  defaultType?: DiscountType;
};

type LocalCombo = { articleId: string; minQuantity: number };

export function DiscountFormModal({ open, onOpenChange, mode = "create", discount, defaultType }: Props) {
  const [type, setType] = useState<DiscountType>(discount?.type ?? defaultType ?? "category");
  const [combo, setCombo] = useState<LocalCombo[]>(discount?.comboItems ?? []);
  const [pickArticle, setPickArticle] = useState<string>("");
  const [pickQty, setPickQty] = useState<number>(1);
  const [search, setSearch] = useState("");

  const filteredArticles = articles.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search),
  );

  const addCombo = () => {
    if (!pickArticle) return;
    setCombo((c) => [
      ...c.filter((x) => x.articleId !== pickArticle),
      { articleId: pickArticle, minQuantity: pickQty },
    ]);
    setPickArticle("");
    setPickQty(1);
  };

  const removeCombo = (id: string) => setCombo((c) => c.filter((x) => x.articleId !== id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
            <Select value={type} onValueChange={(v) => setType(v as DiscountType)} disabled={mode === "edit"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Por Categoría</SelectItem>
                <SelectItem value="combo">Por Combo</SelectItem>
              </SelectContent>
            </Select>
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">El tipo no se puede cambiar al editar.</p>
            )}
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
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <h4 className="font-semibold text-navy">Artículos del combo</h4>

              <div className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={pickArticle} onValueChange={setPickArticle}>
                    <SelectTrigger className="pl-8"><SelectValue placeholder="Buscar artículo..." /></SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredArticles.slice(0, 20).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="font-mono text-xs text-muted-foreground">{a.code}</span> — {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={pickQty}
                  onChange={(e) => setPickQty(parseInt(e.target.value) || 1)}
                  placeholder="Cant. mín."
                />
                <Button type="button" onClick={addCombo} className="bg-brand text-brand-foreground hover:bg-brand/90">
                  <Plus className="mr-1 h-4 w-4" /> Añadir
                </Button>
              </div>

              {combo.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no agregaste artículos al combo.</p>
              ) : (
                <div className="space-y-2">
                  {combo.map((item) => {
                    const art = articles.find((a) => a.id === item.articleId);
                    if (!art) return null;
                    return (
                      <div key={item.articleId} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground">{art.code}</span>
                        <span className="flex-1 font-medium text-navy">{art.name}</span>
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                          Mín: {item.minQuantity}
                        </span>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removeCombo(item.articleId)}>
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
