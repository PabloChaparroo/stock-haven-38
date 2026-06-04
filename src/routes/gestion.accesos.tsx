import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, Save, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { roles as initialRoles, permissionGroups, type Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/accesos")({
  component: AccesosPage,
  head: () => ({ meta: [{ title: "Accesos — Inventia" }] }),
});

function AccesosPage() {
  const [selected, setSelected] = useState<Role | null>(initialRoles[0]);
  const [permState, setPermState] = useState<string[]>(initialRoles[0].permissions);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Role | null>(null);
  const [del, setDel] = useState<Role | null>(null);

  useEffect(() => {
    setPermState(selected?.permissions ?? []);
  }, [selected]);

  const dirty = useMemo(() => {
    if (!selected) return false;
    const a = [...selected.permissions].sort().join("|");
    const b = [...permState].sort().join("|");
    return a !== b;
  }, [selected, permState]);

  const togglePerm = (id: string) =>
    setPermState((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Accesos</h1>
        </div>
        <Button
          onClick={() => setCreate(true)}
          className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90"
        >
          <Plus className="h-4 w-4" /> Nuevo rol
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialRoles.map((r) => {
          const active = selected?.id === r.id;
          return (
            <Card
              key={r.id}
              onClick={() => setSelected(r)}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active
                  ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40"
                  : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy/10 text-navy">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEdit(r);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDel(r);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{r.name}</h3>
              {r.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
              )}
              <div className="mt-2 text-xs text-muted-foreground">Creado: {r.createdAt}</div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                {r.permissions.length} permisos
              </div>
            </Card>
          );
        })}
      </div>

      {selected && (
        <section className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold text-navy">Permisos del rol</h2>
              <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">
                {selected.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!dirty}
                onClick={() => setPermState(selected.permissions)}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Descartar
              </Button>
              <Button
                size="sm"
                disabled={!dirty}
                onClick={() => {
                  selected.permissions = [...permState];
                }}
                className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> Guardar cambios
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {permissionGroups.map((g) => (
              <Card key={g.group} className="overflow-hidden p-0">
                <div className="border-b bg-muted/40 px-4 py-2.5">
                  <div className="text-sm font-semibold text-navy">{g.group}</div>
                </div>
                <div className="divide-y">
                  {g.permissions.map((p) => {
                    const checked = permState.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-muted/30"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePerm(p.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-navy">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <RoleFormModal open={create} onOpenChange={setCreate} />
      <RoleFormModal
        open={!!edit}
        onOpenChange={(v) => !v && setEdit(null)}
        role={edit ?? undefined}
        mode="edit"
      />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`el rol "${del?.name}"`}
        onConfirm={() => setDel(null)}
      />
    </div>
  );
}

function RoleFormModal({
  open,
  onOpenChange,
  role,
  mode = "create",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role?: Role;
  mode?: "create" | "edit";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {mode === "create" ? "Nuevo rol" : "Editar rol"}
          </DialogTitle>
          <DialogDescription>
            Definí el nombre y la descripción del rol. Los permisos se asignan desde la lista de abajo.
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
            <Label>Nombre del rol *</Label>
            <Input defaultValue={role?.name} placeholder="Ej.: Supervisor" />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <textarea
              defaultValue={role?.description}
              placeholder="Breve descripción del propósito del rol"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex justify-end gap-2">
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
