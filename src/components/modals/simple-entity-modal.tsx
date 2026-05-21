import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initial?: { code?: string; name?: string; description?: string };
  entity: "Categoría" | "Marca";
};

export function SimpleEntityModal({ open, onOpenChange, mode = "create", initial, entity }: Props) {
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
