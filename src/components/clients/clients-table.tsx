import { useState } from "react";
import { Eye, Pencil, Trash2, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/mock-data";
import { ClientFormModal } from "@/components/modals/client-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { cn } from "@/lib/utils";

type Props = { clients: Client[] };

export function ClientsTable({ clients }: Props) {
  const [view, setView] = useState<Client | null>(null);
  const [edit, setEdit] = useState<Client | null>(null);
  const [del, setDel] = useState<Client | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">Nro Cliente</TableHead>
              <TableHead className="text-navy">Cliente</TableHead>
              <TableHead className="text-navy">DNI</TableHead>
              <TableHead className="text-navy">Contacto</TableHead>
              <TableHead className="text-navy">Fecha de Alta</TableHead>
              <TableHead className="text-navy">Estado</TableHead>
              <TableHead className="text-right text-navy">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c, i) => (
              <TableRow key={c.id} className={cn("hover:bg-muted/30", i % 2 === 1 && "bg-muted/15")}>
                <TableCell className="font-mono text-xs font-semibold text-navy">{c.number}</TableCell>
                <TableCell>
                  <div className="font-medium text-navy">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-muted-foreground">{c.address}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">{c.dni}</TableCell>
                <TableCell>
                  <div className="text-sm">{c.phone}</div>
                  <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                    <Mail className="h-3 w-3" /> {c.email}
                  </a>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{c.createdAt}</TableCell>
                <TableCell>
                  {c.active ? (
                    <span className="inline-flex h-6 items-center rounded-full bg-brand/15 px-2.5 text-xs font-medium text-brand">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
                      Inactivo
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-navy hover:bg-navy/10" onClick={() => setView(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10" onClick={() => setEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDel(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No hay clientes para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormModal open={!!view} onOpenChange={(v: boolean) => !v && setView(null)} mode="view" client={view ?? undefined} />
      <ClientFormModal open={!!edit} onOpenChange={(v: boolean) => !v && setEdit(null)} mode="edit" client={edit ?? undefined} />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`al cliente "${del?.firstName} ${del?.lastName}"`}
        onConfirm={() => setDel(null)}
      />
    </>
  );
}
