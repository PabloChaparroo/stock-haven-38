import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  ChevronDown,
  CreditCard,
  FileText,
  Plus,
  QrCode,
  Receipt,
  Send,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { clients, formatCurrency, type PaymentMethod, type SaleItem } from "@/lib/mock-data";

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
  { id: "QR/MercadoPago", label: "QR / MP", icon: QrCode },
  { id: "Transferencia", label: "Transfer.", icon: Send },
];

export function FinalizeSaleModal({ open, onOpenChange, total, items, onConfirm }: Props) {
  const [identified, setIdentified] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<(typeof clients)[number] | null>(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([{ id: "p1", method: "Efectivo", amount: 0 }]);
  const [activePayment, setActivePayment] = useState(0);
  const [afip, setAfip] = useState(false);
  const [remito, setRemito] = useState(false);
  const [remitoExpanded, setRemitoExpanded] = useState(false);
  const [delivery, setDelivery] = useState<Record<string, number>>({});
  const [confirmZeroOpen, setConfirmZeroOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setPayments([{ id: "p1", method: "Efectivo", amount: 0 }]);
      setActivePayment(0);
      setIdentified(false);
      setSelectedClient(null);
      setAfip(false);
      setRemito(false);
      setRemitoExpanded(false);
      const base: Record<string, number> = {};
      items.forEach((it) => (base[it.articleId] = Math.max(0, it.quantity - it.delivered)));
      setDelivery(base);
    }
  }, [open, items]);

  const covered = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pending = Math.max(0, total - covered);
  const maxPayments = methods.length;

  const remitoTotalQty = items.reduce((s, it) => s + Math.max(0, it.quantity - it.delivered), 0);
  const remitoTodayQty = items.reduce((s, it) => s + (delivery[it.articleId] || 0), 0);
  const remitoKind = remitoTodayQty >= remitoTotalQty && remitoTotalQty > 0 ? "Total" : remitoTodayQty > 0 ? "Parcial" : "Sin entrega";

  const clientResults = useMemo(() => {
    const s = clientSearch.trim().toLowerCase();
    if (!s) return clients.slice(0, 5);
    return clients
      .filter((c) => `${c.firstName} ${c.lastName} ${c.dni} ${c.email}`.toLowerCase().includes(s))
      .slice(0, 5);
  }, [clientSearch]);

  const setPay = (i: number, patch: Partial<Payment>) =>
    setPayments((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const doConfirm = () => {
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

  const handleConfirm = () => {
    if (covered <= 0) { setConfirmZeroOpen(true); return; }
    doConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-auto p-0">
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <DialogTitle className="text-navy">Generar Cobro</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {items.length} artículo{items.length !== 1 && "s"} · {formatCurrency(total)}
          </p>
        </DialogHeader>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* ============ COLUMNA IZQUIERDA ============ */}
          <div className="space-y-4">
            {/* Cliente */}
            <div>
              <Label className="mb-2 block text-xs uppercase text-muted-foreground">Cliente</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setIdentified(false); setSelectedClient(null); }}
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
                          <span className="flex items-center gap-2">
                            {c.firstName} {c.lastName}
                            {!!c.debt && c.debt > 0 && (
                              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                                Con deuda
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.dni}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedClient && !!selectedClient.debt && selectedClient.debt > 0 && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-destructive">Cliente con deuda</div>
                        <div className="text-muted-foreground">
                          Tiene ventas pendientes por {formatCurrency(selectedClient.debt)}. Verificar antes de continuar.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Factura AFIP */}
            <ToggleRow
              icon={<Receipt className="h-4 w-4" />}
              label="Generar Factura ARCA"
              sub={afip ? "Emite CAE y descuenta stock" : "No se emite comprobante fiscal"}
              checked={afip}
              onChange={setAfip}
            />

            {/* Remito desplegable */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 p-3">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-navy">
                    Generar Remito{" "}
                    <span className={cn(
                      "ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      remitoKind === "Total" && "bg-success/15 text-success",
                      remitoKind === "Parcial" && "bg-amber-100 text-amber-700",
                      remitoKind === "Sin entrega" && "bg-muted text-muted-foreground",
                    )}>
                      {remitoKind}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {remito ? `Se entregan ${remitoTodayQty} de ${remitoTotalQty}` : "No se genera remito"}
                  </div>
                </div>
                {remito && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setRemitoExpanded((v) => !v)}
                  >
                    <ChevronDown className={cn("h-4 w-4 transition", remitoExpanded && "rotate-180")} />
                  </Button>
                )}
                <Switch checked={remito} onCheckedChange={setRemito} />
              </div>
              {remito && remitoExpanded && (
                <div className="border-t border-border px-3 py-2">
                  <div className="grid grid-cols-[1fr_3rem_3rem_3rem_4.5rem] gap-2 px-1 text-[10px] font-semibold uppercase text-muted-foreground">
                    <span>Artículo</span>
                    <span className="text-center">Comp.</span>
                    <span className="text-center">Entr.</span>
                    <span className="text-center">Pend.</span>
                    <span className="text-center">Hoy</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.map((it) => {
                      const pend = Math.max(0, it.quantity - it.delivered);
                      return (
                        <div key={it.articleId} className="grid grid-cols-[1fr_3rem_3rem_3rem_4.5rem] items-center gap-2 rounded-md px-1 py-1 text-xs">
                          <span className="truncate font-medium">{it.name}</span>
                          <span className="text-center text-muted-foreground">{it.quantity}</span>
                          <span className="text-center text-muted-foreground">{it.delivered}</span>
                          <span className="text-center text-amber-600">{pend}</span>
                          <Input
                            type="number"
                            min={0}
                            max={pend}
                            value={delivery[it.articleId] ?? 0}
                            onChange={(e) =>
                              setDelivery((p) => ({
                                ...p,
                                [it.articleId]: Math.min(pend, Math.max(0, Number(e.target.value) || 0)),
                              }))
                            }
                            className="h-7 w-full text-center font-mono text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* ============ COLUMNA DERECHA ============ */}
          <div className="space-y-4">
            {/* Total + boxes */}
            <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total a cobrar</span>
                <span className="text-3xl font-bold text-brand">{formatCurrency(total)}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Box label="Cubierto" value={formatCurrency(covered)} tone="success" />
                <Box label="Pendiente" value={formatCurrency(pending)} tone={pending > 0 ? "danger" : "success"} />
                <Box label="Total" value={formatCurrency(total)} />
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <Label className="mb-2 block text-xs uppercase text-muted-foreground">Métodos de pago</Label>
              <div className="space-y-2">
                {payments.map((p, i) => {
                  const others = payments.reduce((s, q, idx) => s + (idx === i ? 0 : q.amount || 0), 0);
                  const fillAmount = Math.max(0, total - others);
                  return (
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
                        {fillAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => setPay(i, { amount: fillAmount })}
                            className="shrink-0 rounded-md bg-brand/10 px-2 py-1.5 text-[11px] font-medium text-brand hover:bg-brand/20"
                          >
                            Completar {formatCurrency(fillAmount)}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPayments((prev) => [...prev, { id: `p${Date.now()}`, method: "Efectivo", amount: 0 }])}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground transition hover:border-brand hover:text-brand"
                >
                  <Plus className="h-4 w-4" /> Agregar otro método de pago
                </button>
              </div>
            </div>

            <Button
              disabled={!canConfirm}
              className="h-12 w-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={handleConfirm}
            >
              {pending > 0 ? `Confirmar Pago Parcial (${formatCurrency(covered)})` : "Confirmar Pago Completo"} →
            </Button>
          </div>
        </div>

        <CreateClientInline open={createClientOpen} onOpenChange={setCreateClientOpen} onCreated={(c) => setSelectedClient(c as never)} />
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

function ToggleRow({
  label, sub, checked, onChange, icon,
}: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <div className="text-sm font-semibold text-navy">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
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
