import { useState } from "react";
import { Eye, Pencil, Trash2, Check, Minus, Star, Mail, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Supplier } from "@/lib/mock-data";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SupplierFormModal } from "@/components/modals/supplier-form-modal";
import { cn } from "@/lib/utils";

type Props = { suppliers: Supplier[] };

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-brand/15 px-2 text-xs font-medium text-brand">
      <Check className="h-3 w-3" /> Sí
    </span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> No
    </span>
  );
}

function Rating({ value }: { value: number }) {
  if (!value) return <span className="text-xs italic text-muted-foreground">Sin calificar</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function SuppliersTable({ suppliers }: Props) {
  const [view, setView] = useState<Supplier | null>(null);
  const [edit, setEdit] = useState<Supplier | null>(null);
  const [del, setDel] = useState<Supplier | null>(null);
  const [desc, setDesc] = useState<Supplier | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Proveedor</TableHead>
              <TableHead className="text-navy">CUIT</TableHead>
              <TableHead className="text-navy">Contacto</TableHead>
              <TableHead className="text-navy">Dirección</TableHead>
              <TableHead className="text-navy">Relación</TableHead>
              <TableHead className="text-navy">Creación</TableHead>
              <TableHead className="text-navy">Cond. IVA</TableHead>
              <TableHead className="text-navy">Cheque</TableHead>
              <TableHead className="text-navy">Crédito</TableHead>
              <TableHead className="text-right text-navy">Días</TableHead>
              <TableHead className="text-navy">Calificación</TableHead>
              <TableHead className="text-right text-navy">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{s.code}</TableCell>
                <TableCell>
                  <div className="font-medium text-navy">{s.name}</div>
                  {s.description && (
                    <button
                      onClick={() => setDesc(s)}
                      className="text-xs text-muted-foreground hover:text-brand hover:underline"
                    >
                      Ver descripción
                    </button>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{s.cuit}</TableCell>
                <TableCell>
                  <div className="text-sm">{s.phone}</div>
                  <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                    <Mail className="h-3 w-3" /> {s.email}
                  </a>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center gap-1 text-left text-sm text-brand hover:underline">
                        <MapPin className="h-3.5 w-3.5" /> Ver dirección
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-sm">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                        Dirección
                      </div>
                      {s.address}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-navy/10 text-navy">
                    {s.socialRelation}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{s.createdAt}</TableCell>
                <TableCell className="text-xs">{s.ivaCondition}</TableCell>
                <TableCell><YesNo value={s.acceptsCheck} /></TableCell>
                <TableCell><YesNo value={s.acceptsCredit} /></TableCell>
                <TableCell className="text-right font-semibold text-navy">{s.paymentDays}</TableCell>
                <TableCell><Rating value={s.rating} /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-navy hover:bg-navy/10" onClick={() => setView(s)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10" onClick={() => setEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDel(s)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="py-10 text-center text-muted-foreground">
                  No hay proveedores para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!desc} onOpenChange={(v) => !v && setDesc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">{desc?.name}</DialogTitle>
          </DialogHeader>
          <p className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">{desc?.description}</p>
        </DialogContent>
      </Dialog>

      <SupplierFormModal open={!!view} onOpenChange={(v: boolean) => !v && setView(null)} mode="view" supplier={view ?? undefined} />
      <SupplierFormModal open={!!edit} onOpenChange={(v: boolean) => !v && setEdit(null)} mode="edit" supplier={edit ?? undefined} />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`el proveedor "${del?.name}"`}
        onConfirm={() => setDel(null)}
      />
    </>
  );
}
