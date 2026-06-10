import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency, suppliers, type PurchaseOrder } from "@/lib/mock-data";
import { SupplierFormModal } from "@/components/modals/supplier-form-modal";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; order: PurchaseOrder | null };

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-amber-100 text-amber-700",
  Emitida: "bg-sky-100 text-sky-700",
  Recibida: "bg-success/15 text-success",
  Cancelada: "bg-destructive/15 text-destructive",
};

export function OrderDetailModal({ open, onOpenChange, order }: Props) {
  const [supplierOpen, setSupplierOpen] = useState(false);
  if (!order) return null;
  const supplier = suppliers.find((s) => s.id === order.supplierId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-auto">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-navy">Orden de Compra: {order.number}</DialogTitle>
              <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[order.status])}>
                ● {order.status}
              </span>
              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={() => toast.success("Descargando PDF…")}>
                  <Download className="mr-1 h-4 w-4" /> Descargar PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 md:grid-cols-4">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Proveedor</div>
              <button
                type="button"
                disabled={order.status !== "Pendiente"}
                onClick={() => setSupplierOpen(true)}
                className={cn(
                  "text-left text-sm font-semibold text-navy",
                  order.status === "Pendiente" && "underline-offset-2 hover:text-brand hover:underline",
                )}
              >
                {order.supplierName}
              </button>
              <div className="text-xs text-muted-foreground">CUIT: {order.supplierCuit}</div>
            </div>
            <Field label="Fecha Emisión" value={order.issueDate} />
            <Field label="Fecha Est. Recepción" value={order.expectedDate} />
            <Field label="Fecha Real Recepción" value={order.realReceptionDate ?? "—"} />
            <Field label="Operador Emisor" value={order.issuerOperator} />
            <Field label="Operador Receptor" value={order.receiverOperator ?? "—"} />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Artículos de la Orden</h3>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Código</TableHead>
                    <TableHead>Artículo</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-center">Cant. Pedida</TableHead>
                    <TableHead className="text-center">Cant. Recibida</TableHead>
                    <TableHead className="text-center">Cant. Mermas</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((it) => (
                    <TableRow key={it.articleId}>
                      <TableCell className="font-mono text-xs">{it.code}</TableCell>
                      <TableCell className="font-medium text-navy">{it.name}</TableCell>
                      <TableCell className="text-muted-foreground">{it.variant ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(it.unitPrice)}</TableCell>
                      <TableCell className="text-center">{it.qtyOrdered}</TableCell>
                      <TableCell className="text-center text-success">{it.qtyReceived}</TableCell>
                      <TableCell className="text-center text-destructive">{it.qtyDamaged}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatCurrency(it.unitPrice * it.qtyOrdered)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Documentación Asociada</h3>
              {!order.remitoNumber && !order.invoiceNumber && (
                <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
                  Sin documentación asociada.
                </p>
              )}
              {order.remitoNumber && (
                <DocItem icon={<Receipt className="h-4 w-4" />} label="REMITO ADJUNTO" value={order.remitoNumber} />
              )}
              {order.invoiceNumber && (
                <DocItem icon={<FileText className="h-4 w-4" />} label="FACTURA ADJUNTA" value={order.invoiceNumber} />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Liquidación Financiera</h3>
              <div className="rounded-xl border bg-muted/30 p-4">
                <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                <Row label="Impuestos (21%)" value={formatCurrency(order.taxes)} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Monto Total Facturado</span>
                  <span className="font-mono text-2xl font-bold text-navy">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => onOpenChange(false)} className="bg-navy text-navy-foreground hover:bg-navy/90">
              Cerrar Ventana
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SupplierFormModal open={supplierOpen} onOpenChange={setSupplierOpen} mode="view" supplier={supplier} />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-navy">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function DocItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brand/15 text-brand">{icon}</div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="font-mono text-sm font-semibold text-navy">{value}</div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => toast.info(`Abriendo ${value}…`)}>Ver PDF</Button>
    </div>
  );
}
