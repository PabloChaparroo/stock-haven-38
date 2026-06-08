import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Plus, QrCode, Send, Settings, User, UserCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { clients, formatCurrency, type PaymentMethod, type SaleItem } from "@/lib/mock-data";
import { RemitoModal } from "./remito-modal";

type Payment = { id: string; method: PaymentMethod; amount: number };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  total: number;
  items: SaleItem[];
  onConfirm: (result: {
    paid: number;
    method: PaymentMethod;
    clientName: string;
    clientEmail?: string;
    afip: boolean;
    invoice?: { number: string; cae: string };
  }) => void;
};

const methods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "Efectivo", label: "Efectivo", icon: Banknote },
  { id: "Tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "QR/MercadoPago", label: "QR / Mercado Pago", icon: QrCode },
  { id: "Transferencia", label: "Transferencia", icon: Send },
];

export function FinalizeSaleModal({ open, onOpenChange, total, items, onConfirm }: Props) {
  const [identified, setIdentified] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<(typeof clients)[number] | null>(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([{ id: "p1", method: "Efectivo", amount: 0 }]);
  const [partial, setPartial] = useState(false);
  const [afip, setAfip] = useState(true);
  const [autoRemito, setAutoRemito] = useState(true);
  const [remitoOpen, setRemitoOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setPayments([{ id: "p1", method: "Efectivo", amount: 0 }]);
      setIdentified(false);
      setSelectedClient(null);
      setPartial(false);
      setAfip(true);
      setAutoRemito(true);
    }
  }, [open]);

  const covered = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pending = Math.max(0, total - covered);
  const canConfirm = pending === 0 || partial;

  const clientResults = useMemo(() => {
    const s = clientSearch.trim().toLowerCase();
    if (!s) return clients.slice(0, 5);
    return clients
      .filter((c) => `${c.firstName} ${c.lastName} ${c.dni} ${c.email}`.toLowerCase().includes(s))
      .slice(0, 5);
  }, [clientSearch]);

  const setPay = (i: number, patch: Partial<Payment>) =>
    setPayments((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const handleConfirm = () => {
    const clientName = identified && selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "Consumidor Final";
    const primary = payments[0]?.method ?? "Efectivo";
    onConfirm({
      paid: covered,
      method: primary,
      clientName,
      clientEmail: selectedClient?.email,
      afip,
      invoice: afip
        ? { number: `0001-${String(Math.floor(Math.random() * 90000) + 10000)}`, cae: String(Math.floor(Math.random() * 9e13) + 1e13) }
        : undefined,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-navy">Finalizar Venta</DialogTitle>
            <p className="text-xs text-muted-foreground">{items.length} artículo{items.length !== 1 && "s"} · {formatCurrency(total)}</p>
          </DialogHeader>

          <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total a cobrar</span>
              <span className="text-3xl font-bold text-brand">{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase text-muted-foreground">Cliente</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIdentified(false)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  !identified ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <User className="h-4 w-4" /> Consumidor Final
              </button>
              <button
                type="button"
                onClick={() => setIdentified(true)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  identified ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <UserCheck className="h-4 w-4" /> Identificado
              </button>
            </div>

            {identified && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por nombre, DNI o email"
                    value={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : clientSearch}
                    onChange={(e) => { setClientSearch(e.target.value); setSelectedClient(null); }}
                  />
                  <Button variant="outline" size="sm" onClick={() => setCreateClientOpen(true)}>
                    <Plus className="h-4 w-4" /> Crear
                  </Button>
                </div>
                {!selectedClient && clientSearch && (
                  <div className="max-h-40 overflow-auto rounded-md border bg-card">
                    {clientResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedClient(c); setClientSearch(""); }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <span>{c.firstName} {c.lastName}</span>
                        <span className="text-xs text-muted-foreground">{c.dni}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs uppercase text-muted-foreground">Métodos de pago</Label>
              {pending > 0 && (
                <button
                  type="button"
                  onClick={() => setPay(0, { amount: total })}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Completar con {formatCurrency(pending)}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-border bg-card p-2">
                  <div className="flex items-center gap-1">
                    <span className="px-2 text-xs text-muted-foreground">#{i + 1}</span>
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPay(i, { method: m.id })}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
                          p.method === m.id ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <m.icon className="h-3.5 w-3.5" /> {m.label}
                      </button>
                    ))}
                    {payments.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPayments((prev) => prev.filter((_, idx) => idx !== i))}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={p.amount || ""}
                      onChange={(e) => setPay(i, { amount: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-right font-mono"
                    />
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => setPay(i, { amount: total })}>Abonar Total</Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => setPay(i, { amount: Math.round(total / 2) })}>Abonar Mitad</Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => setPay(i, { amount: pending + (p.amount || 0) })}>Pendiente</Button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPayments((prev) => [...prev, { id: `p${Date.now()}`, method: "Efectivo", amount: 0 }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground transition hover:border-brand hover:text-brand"
              >
                <Plus className="h-4 w-4" /> Agregar otro método de pago
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Box label="Cubierto" value={formatCurrency(covered)} tone="success" />
            <Box label="Pendiente" value={formatCurrency(pending)} tone={pending > 0 ? "danger" : "success"} />
            <Box label="Total" value={formatCurrency(total)} />
          </div>

          <ToggleRow
            label="Pago parcial"
            sub={pending > 0 ? `Quedan ${formatCurrency(pending)} pendientes` : "Cobro completo"}
            checked={partial}
            onChange={setPartial}
            tone="amber"
          />
          <ToggleRow label="Generar Factura AFIP" sub="Emite CAE y descuenta stock" checked={afip} onChange={setAfip} />
          <ToggleRow
            label="Generar Remito Automático"
            sub="Asume que se entrega todo"
            checked={autoRemito}
            onChange={setAutoRemito}
            extra={
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setRemitoOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            }
          />

          <Button
            disabled={!canConfirm}
            className="h-12 w-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
            onClick={handleConfirm}
          >
            {partial && pending > 0 ? "Confirmar Pago Parcial" : "Confirmar Pago Completo"} →
          </Button>
        </DialogContent>
      </Dialog>

      <RemitoModal open={remitoOpen} onOpenChange={setRemitoOpen} items={items} onEmit={() => {}} />

      <CreateClientInline open={createClientOpen} onOpenChange={setCreateClientOpen} onCreated={(c) => setSelectedClient(c as never)} />
    </>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 text-center",
        tone === "success" && "border-success/30 bg-success/5",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        !tone && "border-border bg-muted/40",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-sm font-semibold", tone === "danger" && "text-destructive", tone === "success" && "text-success")}>
        {value}
      </div>
    </div>
  );
}

function ToggleRow({
  label, sub, checked, onChange, tone, extra,
}: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; tone?: "amber"; extra?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        tone === "amber" ? "border-amber-200 bg-amber-50" : "border-border bg-card",
      )}
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-navy">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      {extra}
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function CreateClientInline({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (c: { firstName: string; lastName: string; dni: string; email: string }) => void }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-navy">Crear Cliente</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label>Nombre</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} /></div>
          <div><Label>Apellido</Label><Input value={last} onChange={(e) => setLast(e.target.value)} /></div>
          <div><Label>DNI / CUIT</Label><Input value={dni} onChange={(e) => setDni(e.target.value)} /></div>
          <div><Label>Correo electrónico</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              className="bg-navy text-navy-foreground hover:bg-navy/90"
              onClick={() => { onCreated({ firstName: first, lastName: last, dni, email }); onOpenChange(false); }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
