import { useState } from "react";
import { Eye, Pencil, ShieldCheck, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type User } from "@/lib/mock-data";
import { ImageZoomModal } from "@/components/modals/image-zoom-modal";
import { UserFormModal } from "@/components/modals/user-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = { users: User[] };

export function UsersTable({ users }: Props) {
  const [zoom, setZoom] = useState<User | null>(null);
  const [details, setDetails] = useState<User | null>(null);
  const [edit, setEdit] = useState<User | null>(null);
  const [del, setDel] = useState<User | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">ID</TableHead>
              <TableHead className="text-navy">Nombre y apellido</TableHead>
              <TableHead className="text-navy">DNI</TableHead>
              <TableHead className="text-navy">Email</TableHead>
              <TableHead className="text-navy">Teléfono</TableHead>
              <TableHead className="text-navy">Creación</TableHead>
              <TableHead className="text-navy">Imagen</TableHead>
              <TableHead className="text-navy">Roles</TableHead>
              <TableHead className="text-navy">Estado</TableHead>
              <TableHead className="text-right text-navy">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">#{u.id.padStart(4, "0")}</TableCell>
                <TableCell>
                  <div className="font-medium text-navy">
                    {u.firstName} {u.lastName}
                  </div>
                  {u.description && (
                    <button
                      onClick={() => setDetails(u)}
                      className="text-xs text-muted-foreground hover:text-brand hover:underline"
                    >
                      Ver descripción
                    </button>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{u.dni}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{u.phone}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{u.createdAt}</TableCell>
                <TableCell>
                  <button
                    onClick={() => setZoom(u)}
                    className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border bg-muted/40 transition hover:ring-2 hover:ring-brand"
                  >
                    <img src={u.image} alt={u.firstName} className="h-full w-full object-cover" />
                  </button>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-brand/10 text-brand hover:bg-brand/20"
                        aria-label="Ver roles"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 border-brand/30">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                        Roles asignados
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="bg-navy/10 text-navy">
                            {r}
                          </Badge>
                        ))}
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">Sin roles asignados</span>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      u.active ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {u.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEdit(u)}
                      className="h-8 w-8 text-brand hover:bg-brand/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDel(u)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                  No hay usuarios para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ImageZoomModal
        open={!!zoom}
        onOpenChange={(v) => !v && setZoom(null)}
        src={zoom?.image}
        alt={zoom?.firstName}
      />

      <Dialog open={!!details} onOpenChange={(v) => !v && setDetails(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {details?.firstName} {details?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <img src={details?.image} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div className="text-sm text-muted-foreground">{details?.email}</div>
          </div>
          <p className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">{details?.description}</p>
        </DialogContent>
      </Dialog>

      <UserFormModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} mode="edit" user={edit ?? undefined} />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`al usuario "${del?.firstName} ${del?.lastName}"`}
        onConfirm={() => setDel(null)}
      />
    </>
  );
}

// Eye import kept for potential future use
void Eye;
