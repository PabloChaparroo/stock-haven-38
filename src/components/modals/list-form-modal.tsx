import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { PriceList } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initial?: PriceList;
};

export function ListFormModal({ open, onOpenChange, mode = "create", initial }: Props) {
  const [active, setActive] = useState<boolean>(initial?.active ?? true);

  useEffect(() => {
    if (open) setActive(initial?.active ?? true);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {mode === "create" ? "Nueva Lista" : "Editar Lista"}
          </DialogTitle>
          <DialogDescription>
            Completá la información de la lista de precios.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="space-y-1.5">
            <Label>Código</Label>
            <Input defaultValue={initial?.code} placeholder="Cód. Lista" />
          </div>
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input defaultValue={initial?.name} placeholder="Nombre de la lista" required />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea defaultValue={initial?.description} rows={3} placeholder="Breve descripción" />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <Label className="cursor-pointer">Lista activa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
