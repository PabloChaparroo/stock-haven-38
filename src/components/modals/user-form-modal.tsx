import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ShieldCheck, UserPlus } from "lucide-react";
import { roles as allRoles, type User } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  user?: User;
};

export function UserFormModal({ open, onOpenChange, mode = "create", user }: Props) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles ?? []);
  const [active, setActive] = useState<boolean>(user?.active ?? true);

  const toggleRole = (name: string) =>
    setSelectedRoles((prev) => (prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-navy">
                {mode === "create" ? "Crear usuario" : "Editar usuario"}
              </DialogTitle>
              <DialogDescription>Completá los datos del usuario y asigná uno o más roles.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <Field label="Nombre" defaultValue={user?.firstName} placeholder="Nombre" />
          <Field label="Apellido" defaultValue={user?.lastName} placeholder="Apellido" />
          <Field label="DNI" defaultValue={user?.dni} placeholder="00.000.000" />
          <Field label="Teléfono" defaultValue={user?.phone} placeholder="+54 9 11 ..." />
          <div className="sm:col-span-2">
            <Field label="Email" type="email" defaultValue={user?.email} placeholder="usuario@inventia.com" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Roles</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-10 w-full justify-between gap-2 border-input"
                >
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedRoles.length === 0 ? (
                      <span className="text-muted-foreground">Seleccionar roles…</span>
                    ) : (
                      selectedRoles.map((r) => (
                        <Badge key={r} variant="secondary" className="bg-brand/15 text-brand">
                          {r}
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-brand">
                  Disponibles
                </div>
                <div className="grid gap-1">
                  {allRoles.map((r) => {
                    const checked = selectedRoles.includes(r.name);
                    return (
                      <label
                        key={r.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleRole(r.name)} />
                        <ShieldCheck className="h-4 w-4 text-navy/60" />
                        <span className="text-sm font-medium text-navy">{r.name}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>Descripción</Label>
            <Textarea defaultValue={user?.description} placeholder="Notas internas del usuario" rows={3} />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-navy">Usuario activo</div>
              <div className="text-xs text-muted-foreground">Puede iniciar sesión en el sistema.</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
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

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...rest} />
    </div>
  );
}
