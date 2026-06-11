import { useEffect, useState } from "react";
import { Banknote, CreditCard, QrCode, Send, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, type PaymentMethod, type Sale } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: Sale | null;
  /** Compat: kept signature; multi-pay registers each part sequentially */
  onRegister: (amount: number, method: PaymentMethod) => void;
};

type Payment = { id: string; method: PaymentMethod; amount: number };

const methods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "Efectivo", label: "Efectivo", icon: Banknote },
  { id: "Tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "QR/MercadoPago", label: "QR / MP", icon: QrCode },
  { id: "Transferencia", label: "Transfer.", icon: Send },
];

export function RegisterPaymentModal({ open, onOpenChange, sale, onRegister }: Props) {
  const [payments, setPayments] = useState<Payment[]>([{ id: "p1", method: "Efectivo", amount: 0 }]);
  const [active, setActive] = useState(0);

  const pending = sale ? Math.max(0, sale.total - sale.paid) : 0;

  useEffect(() => {
    if (open && sale) {
      setPayments([{ id: "p1", method: "Efectivo", amount: pending }]);
      setActive(0);
    }
  }, [open, sale, pending]);

  if (!sale) return null;

  const covered = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = Math.max(0, pending - covered);

  const setPay = (i: number, patch: Partial<Payment>) =>
    setPayments((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const handleSubmit = () => {
    payments.filter((p) => p.amount > 0).forEach((p) => onRegister(p.amount, p.method));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">Registrar Pago — {sale.number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          <Box label="Pendiente" value={formatCurrency(pending)} tone="danger" />
          <Box label="Cubierto" value={formatCurrency(covered)} tone="success" />
          <Box label="Resta" value={formatCurrency(remaining)} tone={remaining > 0 ? "danger" : "success"} />
        </div>

        <div>
          <Label className="mb-2 block text-xs uppercase text-muted-foreground">Métodos de pago</Label>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
              {payments.map((p, i) => {
                const m = methods.find((x) => x.id === p.method)!;
                const isActive = active === i;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                      isActive ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-[10px] opacity-60">#{i + 1}</span>
                    <m.icon className="h-3.5 w-3.5" />
                    <span className="font-mono">{p.amount > 0 ? formatCurrency(p.amount) : "—"}</span>
                    {payments.length > 1 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPayments((prev) => prev.filter((_, idx) => idx !== i));
                          setActive((a) => Math.max(0, a >= i ? a - 1 : a));
                        }}
                        className="ml-0.5 rounded p-0.5 opacity-60 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
              {payments.length < methods.length && (
                <button
                  type="button"
                  onClick={() => {
                    const used = new Set(payments.map((p) => p.method));
                    const next = methods.find((m) => !used.has(m.id))?.id ?? "Efectivo";
                    setPayments((prev) => [...prev, { id: `p${Date.now()}`, method: next, amount: 0 }]);
                    setActive(payments.length);
                  }}
                  className="ml-auto flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-brand"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              )}
            </div>

            {(() => {
              const i = Math.min(active, payments.length - 1);
              const p = payments[i];
              if (!p) return null;
              const others = payments.reduce((s, q, idx) => s + (idx === i ? 0 : q.amount || 0), 0);
              const fill = Math.max(0, pending - others);
              return (
                <div className="space-y-2 p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {methods.map((m) => {
                      const usedByOther = payments.some((q, idx) => idx !== i && q.method === m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={usedByOther}
                          onClick={() => setPay(i, { method: m.id })}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition",
                            p.method === m.id ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-muted",
                            usedByOther && "cursor-not-allowed opacity-30 hover:bg-transparent",
                          )}
                        >
                          <m.icon className="h-3.5 w-3.5" /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={fill}
                      placeholder="Monto"
                      value={p.amount || ""}
                      onChange={(e) => setPay(i, { amount: Math.min(fill, Math.max(0, Number(e.target.value) || 0)) })}
                      className="text-right font-mono"
                    />
                    {fill > 0 && (
                      <button
                        type="button"
                        onClick={() => setPay(i, { amount: fill })}
                        className="shrink-0 rounded-md bg-brand/10 px-2 py-1.5 text-[11px] font-medium text-brand hover:bg-brand/20"
                      >
                        Completar {formatCurrency(fill)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={covered <= 0}
            onClick={handleSubmit}
          >
            Registrar {formatCurrency(covered)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 text-center",
        tone === "success" && "border-success/30 bg-success/5",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        !tone && "border-border bg-card",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-sm font-semibold", tone === "danger" && "text-destructive", tone === "success" && "text-success")}>
        {value}
      </div>
    </div>
  );
}
