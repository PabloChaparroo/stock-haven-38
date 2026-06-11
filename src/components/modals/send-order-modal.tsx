import { useEffect, useState } from "react";
import { Mail, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, suppliers as allSuppliers, type PurchaseOrder } from "@/lib/mock-data";

type Props = {
  order: PurchaseOrder | null;
  onClose: () => void;
  onSent?: (order: PurchaseOrder, emails: string[]) => void;
};

export function SendOrderModal({ order, onClose, onSent }: Props) {
  const supplier = order ? allSuppliers.find((s) => s.id === order.supplierId) : null;
  const defaultEmail = supplier?.email ?? "";

  const [primary, setPrimary] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!order) return;
    setPrimary(defaultEmail);
    setExtra([]);
    setSubject(`Orden de Compra ${order.number} — Inventia`);
    setBody(
      `Estimados ${order.supplierName},\n\n` +
      `Adjuntamos la Orden de Compra ${order.number} con fecha de emisión ${order.issueDate} ` +
      `y fecha estimada de recepción ${order.expectedDate}.\n\n` +
      `Total: ${formatCurrency(order.total)}.\n\n` +
      `Por favor, confirmen disponibilidad y plazos.\n\nSaludos cordiales,\nInventia`,
    );
  }, [order, defaultEmail]);

  if (!order) return null;

  const submit = () => {
    const emails = [primary, ...extra].map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return toast.error("Agregá al menos un correo destinatario");
    onSent?.(order, emails);
    toast.success(`Orden ${order.number} enviada a ${emails.length} correo(s)`);
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">Enviar Orden de Compra al proveedor</DialogTitle>
          <DialogDescription>Revisá los datos y el correo antes de enviar.</DialogDescription>
        </DialogHeader>

        {/* Datos de la orden */}
        <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <Field label="N° Orden" value={order.number} mono />
          <Field label="Proveedor" value={order.supplierName} />
          <Field label="CUIT" value={order.supplierCuit} mono />
          <Field label="Fecha de Emisión" value={order.issueDate} />
          <Field label="Fecha Est. Recepción" value={order.expectedDate} />
          <Field label="Total" value={formatCurrency(order.total)} mono bold />
        </div>

        {/* Items */}
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">P. Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it) => (
                <TableRow key={it.articleId}>
                  <TableCell>
                    <div className="font-medium text-navy">{it.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{it.code}</div>
                  </TableCell>
                  <TableCell className="text-center font-mono">{it.qtyOrdered}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(it.unitPrice)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(it.unitPrice * it.qtyOrdered)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Correos */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> Correo del proveedor (editable)
          </Label>
          <Input
            type="email"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            placeholder="proveedor@empresa.com"
          />

          {extra.map((email, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setExtra((p) => p.map((x, idx) => (idx === i ? e.target.value : x)))}
                placeholder="otro@empresa.com"
              />
              <Button
                size="icon" variant="ghost"
                className="h-10 w-10 text-destructive hover:bg-destructive/10"
                onClick={() => setExtra((p) => p.filter((_, idx) => idx !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button" variant="outline" size="sm"
            onClick={() => setExtra((p) => [...p, ""])}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar otro correo
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label>Asunto</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Mensaje</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-navy text-navy-foreground hover:bg-navy/90 gap-1.5" onClick={submit}>
            <Send className="h-4 w-4" /> Enviar Orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${bold ? "font-semibold text-navy" : ""}`}>{value}</span>
    </div>
  );
}
