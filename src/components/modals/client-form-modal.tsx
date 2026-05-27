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
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import type { Client } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit" | "view";
  client?: Client;
};

export function ClientFormModal({ open, onOpenChange, mode = "create", client }: Props) {
  const readOnly = mode === "view";
  const title = mode === "create" ? "Nuevo cliente" : mode === "edit" ? "Editar cliente" : "Detalle del cliente";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-navy">{title}</DialogTitle>
              <DialogDescription>
                {readOnly ? "Información del cliente." : "Completá los datos del cliente."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-brand">Datos personales</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nombre *" defaultValue={client?.firstName} readOnly={readOnly} placeholder="Nombre" />
              <Field label="Apellido *" defaultValue={client?.lastName} readOnly={readOnly} placeholder="Apellido" />
              <Field label="DNI *" type="number" defaultValue={client?.dni?.replace(/\D/g, "")} readOnly={readOnly} placeholder="00000000" />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-brand">Datos de contacto</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono" defaultValue={client?.phone} readOnly={readOnly} placeholder="+54 9 11 ..." />
              <Field label="Correo electrónico" type="email" defaultValue={client?.email} readOnly={readOnly} placeholder="cliente@mail.com" />
              <div className="sm:col-span-2">
                <Field label="Dirección física" defaultValue={client?.address} readOnly={readOnly} placeholder="Calle, número, ciudad" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {readOnly ? "Cerrar" : "Cancelar"}
            </Button>
            {!readOnly && (
              <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
                Guardar cliente
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...rest} className="focus-visible:ring-brand" />
    </div>
  );
}
