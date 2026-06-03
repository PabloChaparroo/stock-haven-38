import { useState } from "react";
import { Eye, Pencil, Trash2, Check, Minus, Star, Mail, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Supplier } from "@/lib/mock-data";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SupplierFormModal } from "@/components/modals/supplier-form-modal";
import { cn } from "@/lib/utils";

type Props = { suppliers: Supplier[] };

const truncate = (s: string, n = 28) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

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
  if (!value) return <span className="text-xs text-muted-foreground">Sin calificar</span>;
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
  const [details, setDetails] = useState<Supplier | null>(null);
  const [addressOf, setAddressOf] = useState<Supplier | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Proveedor</TableHead>
              <TableHead className="text-navy">Relación</TableHead>
              <TableHead className="text-navy">Dirección</TableHead>
              <TableHead className="text-navy">Contacto</TableHead>
              <TableHead className="text-navy">CUIT</TableHead>
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
                <TableCell className="font-medium text-navy">{s.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-left text-sm hover:text-brand">
                        {truncate(s.description)}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-sm">{s.description}</PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{s.phone}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-navy/10 text-navy">
                    {s.socialRelation}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{truncate(s.address, 24)}</TableCell>
                <TableCell>
                  <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
                    <Mail className="h-3.5 w-3.5" />
                    {truncate(s.email, 20)}
                  </a>
                </TableCell>
                <TableCell className="font-mono text-xs">{s.cuit}</TableCell>
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
                <TableCell colSpan={15} className="py-10 text-center text-muted-foreground">
                  No hay proveedores para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
