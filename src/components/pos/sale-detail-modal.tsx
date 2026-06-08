import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, type Sale } from "@/lib/mock-data";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; sale: Sale | null };

export function SaleDetailModal({ open, onOpenChange, sale }: Props) {
  if (!sale) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">Detalle — {sale.number}</DialogTitle>
          <p className="text-xs text-muted-foreground">{sale.clientName} · {sale.date}</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente" value={sale.clientName} />
          <Field label="Documento" value={sale.clientDoc || "—"} />
          <Field label="Comprobante" value={sale.invoiceNumber ? `Factura ${sale.invoiceNumber}` : "Interno"} />
          <Field label="Fecha" value={sale.date} />
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

        {sale.deliveries.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Remitos / Entregas</h3>
            <div className="space-y-1">
              {sale.deliveries.map((d) => (
                <div key={d.id} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                  <div className="flex justify-between"><span className="font-semibold">{d.id}</span><span className="text-xs text-muted-foreground">{d.date}</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">{d.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</div>
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

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "success" | "danger" }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={strong ? "text-base font-bold text-navy" : "text-sm text-muted-foreground"}>{label}</span>
      <span className={`font-mono ${strong ? "text-xl font-bold text-brand" : "text-sm"} ${tone === "success" ? "text-success" : ""} ${tone === "danger" ? "text-destructive" : ""}`}>
        {value}
      </span>
    </div>
  );
}
