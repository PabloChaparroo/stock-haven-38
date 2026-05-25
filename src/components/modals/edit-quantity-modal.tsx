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
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleName?: string;
  initialQuantity?: number;
  onConfirm?: (qty: number) => void;
};

export function EditQuantityModal({ open, onOpenChange, articleName, initialQuantity = 1, onConfirm }: Props) {
  const [qty, setQty] = useState(initialQuantity);

  useEffect(() => {
    if (open) setQty(initialQuantity);
  }, [open, initialQuantity]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-navy">Editar cantidad mínima</DialogTitle>
          <DialogDescription>
            {articleName ? <>Modificá la cantidad mínima requerida de <strong>{articleName}</strong>.</> : "Modificá la cantidad mínima."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm?.(Math.max(1, qty));
            onOpenChange(false);
          }}
        >
          <div className="space-y-1.5">
            <Label>Cantidad mínima requerida *</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
