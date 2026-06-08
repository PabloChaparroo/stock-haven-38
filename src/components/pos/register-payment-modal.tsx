import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, type PaymentMethod, type Sale } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; sale: Sale | null; onRegister: (amount: number, method: PaymentMethod) => void };

const methods: PaymentMethod[] = ["Efectivo", "Tarjeta", "QR/MercadoPago", "Transferencia"];

export function RegisterPaymentModal({ open, onOpenChange, sale, onRegister }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (sale && open) setAmount(Math.max(0, sale.total - sale.paid));
  }, [sale, open]);

  if (!sale) return null;
  const pending = Math.max(0, sale.total - sale.paid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">Registrar Pago — {sale.number}</DialogTitle>
        </DialogHeader>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
          <div className="text-xs uppercase text-muted-foreground">Pendiente</div>
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(pending)}</div>
        </div>

        <div>
          <Label className="text-xs uppercase text-muted-foreground">Método</Label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition",
                  method === m ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Monto</Label>
          <Input type="number" min={0} max={pending} value={amount} onChange={(e) => setAmount(Math.min(pending, Math.max(0, Number(e.target.value) || 0)))} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={amount <= 0}
            onClick={() => { onRegister(amount, method); onOpenChange(false); }}
          >
            Registrar Pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
