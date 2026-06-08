import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, type Sale } from "@/lib/mock-data";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; sale: Sale | null; onIssue: () => void };

export function CreditNoteModal({ open, onOpenChange, sale, onIssue }: Props) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && sale) {
      const base: Record<string, number> = {};
      sale.items.forEach((it) => (base[it.articleId] = 0));
      setQty(base);
      setReason("");
    }
  }, [open, sale]);

  if (!sale) return null;

  const total = sale.items.reduce((s, it) => s + (qty[it.articleId] || 0) * it.price, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-navy">Devolución / Nota de Crédito — {sale.number}</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Comprado</TableHead>
                <TableHead className="text-center">A devolver</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((it) => (
                <TableRow key={it.articleId}>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell className="text-center">{it.quantity}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={0}
                      max={it.quantity}
                      value={qty[it.articleId] ?? 0}
                      onChange={(e) => setQty((p) => ({ ...p, [it.articleId]: Math.min(it.quantity, Math.max(0, Number(e.target.value) || 0)) }))}
                      className="mx-auto h-8 w-20 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency((qty[it.articleId] || 0) * it.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <Label>Motivo</Label>
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describí el motivo de la devolución" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2">
          <span className="text-sm font-semibold text-navy">Total NC</span>
          <span className="font-mono text-xl font-bold text-destructive">{formatCurrency(total)}</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            variant="destructive"
            disabled={total <= 0 || !reason.trim()}
            onClick={() => { onIssue(); onOpenChange(false); }}
          >
            Emitir Nota de Crédito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
