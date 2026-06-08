import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SaleItem } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: SaleItem[];
  onEmit: (deliveries: { articleId: string; quantity: number }[]) => void;
};

export function RemitoModal({ open, onOpenChange, items, onEmit }: Props) {
  const [today, setToday] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      const base: Record<string, number> = {};
      items.forEach((it) => (base[it.articleId] = Math.max(0, it.quantity - it.delivered)));
      setToday(base);
    }
  }, [open, items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-navy">Generador de Remito</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Comprada</TableHead>
                <TableHead className="text-center">Entregada</TableHead>
                <TableHead className="text-center">Pendiente</TableHead>
                <TableHead className="text-center">A entregar hoy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => {
                const pend = Math.max(0, it.quantity - it.delivered);
                return (
                  <TableRow key={it.articleId}>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="text-center">{it.quantity}</TableCell>
                    <TableCell className="text-center">{it.delivered}</TableCell>
                    <TableCell className="text-center text-amber-600">{pend}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={0}
                        max={pend}
                        value={today[it.articleId] ?? 0}
                        onChange={(e) =>
                          setToday((p) => ({ ...p, [it.articleId]: Math.min(pend, Math.max(0, Number(e.target.value) || 0)) }))
                        }
                        className="mx-auto h-8 w-20 text-center"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="bg-navy text-navy-foreground hover:bg-navy/90"
            onClick={() => {
              onEmit(items.map((it) => ({ articleId: it.articleId, quantity: today[it.articleId] || 0 })));
              onOpenChange(false);
            }}
          >
            Emitir Remito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
