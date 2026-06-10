import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, FileText, Truck, Percent } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, type Sale } from "@/lib/mock-data";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; sale: Sale | null };

export function SaleDetailModal({ open, onOpenChange, sale }: Props) {
  if (!sale) return null;

  const totalItems = sale.items.reduce((s, it) => s + it.quantity, 0);

  const downloadRemito = (id: string) => toast.success(`Descargando remito ${id}…`);
  const viewInvoice = () => toast.info(`Abriendo factura ${sale.invoiceNumber}`);
  const downloadInvoice = () => toast.success(`Descargando factura ${sale.invoiceNumber}…`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">Detalle — {sale.number}</DialogTitle>
          <p className="text-xs text-muted-foreground">{sale.clientName} · {sale.date} {sale.time}</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Cliente" value={sale.clientName} />
          <Field label="Documento" value={sale.clientDoc || "—"} />
          <Field label="Fecha" value={sale.date} />
          <Field label="Hora" value={sale.time} />
          <Field label="Operador" value={sale.operator} />
          <Field label="Artículos" value={`${totalItems} unid. (${sale.items.length} ítems)`} />
          <Field label="Comprobante" value={sale.invoiceNumber ? `Factura ${sale.invoiceNumber}` : "Interno"} />
          <Field label="Estado" value={sale.status} />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Artículos</h3>
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-center">Entregado</TableHead>
                  <TableHead className="text-right">P.Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((it) => (
                  <TableRow key={it.articleId}>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="text-center">{it.quantity}×</TableCell>
                    <TableCell className="text-center text-success">{it.delivered}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(it.price)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(it.price * it.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <Row label="Subtotal" value={formatCurrency(sale.subtotal)} />
          {sale.discountAmount ? (
            <Row
              label={
                <span className="inline-flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" /> Descuento ({sale.discountPercent}%)
                </span>
              }
              value={`- ${formatCurrency(sale.discountAmount)}`}
              tone="danger"
            />
          ) : null}
          <Row label="Total" value={formatCurrency(sale.total)} strong />
          <Row label="Pagado" value={formatCurrency(sale.paid)} tone="success" />
          {sale.total - sale.paid > 0 && <Row label="Pendiente" value={formatCurrency(sale.total - sale.paid)} tone="danger" />}
        </div>

        {sale.payments.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Historial de Pagos</h3>
            <div className="space-y-1">
              {sale.payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm">
                  <span className="text-navy">{p.method}</span>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-success">{formatCurrency(p.amount)}</div>
                    <div className="text-xs text-muted-foreground">{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sale.invoiceNumber && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Factura</h3>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" />
                <div>
                  <div className="text-sm font-semibold text-navy">Factura {sale.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">{sale.date} · {formatCurrency(sale.total)}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-8" onClick={viewInvoice}>
                  <Eye className="mr-1 h-3.5 w-3.5" /> Ver
                </Button>
                <Button size="sm" className="h-8 bg-navy text-navy-foreground hover:bg-navy/90" onClick={downloadInvoice}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Descargar
                </Button>
              </div>
            </div>
          </div>
        )}

        {sale.deliveries.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Remitos ({sale.deliveries.length})
            </h3>
            <div className="space-y-2">
              {sale.deliveries.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-navy" />
                      <div>
                        <div className="text-sm font-semibold text-navy">{d.id}</div>
                        <div className="text-xs text-muted-foreground">{d.date}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => downloadRemito(d.id)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Descargar
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1 rounded-md bg-muted/40 px-2 py-1.5">
                    {d.items.map((i) => (
                      <div key={i.articleId} className="flex justify-between text-xs">
                        <span className="text-navy">{i.name}</span>
                        <span className="font-mono text-muted-foreground">{i.quantity}× entregados</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Cerrar</Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-navy">{value}</div>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: React.ReactNode; value: string; strong?: boolean; tone?: "success" | "danger" }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={strong ? "text-base font-bold text-navy" : "text-sm text-muted-foreground"}>{label}</span>
      <span className={`font-mono ${strong ? "text-xl font-bold text-brand" : "text-sm"} ${tone === "success" ? "text-success" : ""} ${tone === "danger" ? "text-destructive" : ""}`}>
        {value}
      </span>
    </div>
  );
}
