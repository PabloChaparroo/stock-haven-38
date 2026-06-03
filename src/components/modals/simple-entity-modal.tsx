import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initial?: { code?: string; name?: string; description?: string; active?: boolean };
  entity: "Categoría" | "Marca";
};

export function SimpleEntityModal({ open, onOpenChange, mode = "create", initial, entity }: Props) {
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {mode === "create" ? `Nueva ${entity}` : `Editar ${entity}`}
          </DialogTitle>
          <DialogDescription>
            Completá la información de la {entity.toLowerCase()}.
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
            <Input defaultValue={initial?.code} placeholder={`Cód. ${entity}`} />
          </div>
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input defaultValue={initial?.name} placeholder={`Nombre de ${entity.toLowerCase()}`} />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea defaultValue={initial?.description} placeholder="Breve descripción" rows={3} />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-navy">{entity} activa</div>
              <div className="text-xs text-muted-foreground">Visible y utilizable en el sistema.</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>


          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
