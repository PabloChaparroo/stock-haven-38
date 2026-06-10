import { useEffect, useState } from "react";
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
import { categories, priceLists, type DiscountType, type Discount } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  discount?: Discount;
  defaultType?: DiscountType;
};

export function DiscountFormModal({ open, onOpenChange, mode = "create", discount, defaultType }: Props) {
  const [type, setType] = useState<DiscountType>(discount?.type ?? defaultType ?? "category");
  const [listId, setListId] = useState<string | undefined>(discount?.listId);

  useEffect(() => {
    if (!open) return;
    setType(discount?.type ?? defaultType ?? "category");
    setListId(discount?.listId);
  }, [open, discount, defaultType]);

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
                <SelectItem value="list">Por Lista</SelectItem>
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
            <div className="space-y-1.5">
              <Label>Lista de precios a aplicar *</Label>
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar lista" /></SelectTrigger>
                <SelectContent>
                  {priceLists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.articleIds.length} artículos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El descuento se aplicará a todos los artículos de la lista seleccionada.
              </p>
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
