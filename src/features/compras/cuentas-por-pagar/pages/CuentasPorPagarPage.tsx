import { useMemo, useState } from "react";
import { Search, Calendar as CalendarIcon, X, Eye, CreditCard, Wallet, AlertTriangle, Banknote, Building2, Hash, FileText, Plus, Trash2, Receipt, Landmark, Smartphone, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrders, formatCurrency } from "@/lib/mock-data";

type PayStatus = "Pendiente" | "Pago Parcial" | "Pagada" | "Vencida";

type Payable = {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paid: number;
  status: PayStatus;
};

const STATUS_STYLES: Record<PayStatus, string> = {
  Pendiente: "bg-amber-100 text-amber-700",
  "Pago Parcial": "bg-sky-100 text-sky-700",
  Pagada: "bg-success/15 text-success",
  Vencida: "bg-destructive/15 text-destructive",
};

const PAGE_SIZE = 14;

const parseDate = (s: string) => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate = (d: Date) => format(d, "dd/MM/yyyy");

// Build payables from invoiced/received purchase orders
const TODAY = new Date(2026, 6, 15); // 15/07/2026

const initialPayables: Payable[] = purchaseOrders
  .filter((o) => o.status === "Recibida" || o.status === "Emitida")
  .map((o, i) => {
    const issue = parseDate(o.issueDate);
    const due = addDays(issue, 30);
    const paid = i % 5 === 0 ? o.total : i % 7 === 0 ? Math.round(o.total * 0.5) : 0;
    let status: PayStatus;
    if (paid >= o.total) status = "Pagada";
    else if (paid > 0) status = "Pago Parcial";
    else if (due < TODAY) status = "Vencida";
    else status = "Pendiente";
    return {
      id: `pay-${i + 1}`,
      invoiceNumber: o.invoiceNumber ?? `FAC-A-0001-${String(56789 + i).padStart(7, "0")}`,
      orderNumber: o.number,
      supplierName: o.supplierName,
      issueDate: o.issueDate,
      dueDate: fmtDate(due),
      total: o.total,
      paid,
      status,
    };
  });

export function CuentasPorPagarPage() {
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PayStatus>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Payable | null>(null);
  const [paying, setPaying] = useState<Payable | null>(null);

  const resetPage = () => setPage(1);

  // KPIs
  const kpis = useMemo(() => {
    const open = payables.filter((p) => p.status !== "Pagada");
    const totalDebt = open.reduce((s, p) => s + (p.total - p.paid), 0);
    const soon7 = open.filter((p) => {
      const d = parseDate(p.dueDate); const diff = (d.getTime() - TODAY.getTime()) / 86400000;
      return diff >= 0 && diff <= 7;
    });
    const overdue = open.filter((p) => p.status === "Vencida");
    return {
      totalDebt, openCount: open.length,
      soon7Total: soon7.reduce((s, p) => s + (p.total - p.paid), 0),
      overdueCount: overdue.length,
    };
  }, [payables]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return payables.filter((p) => {
      if (s && !`${p.invoiceNumber} ${p.orderNumber} ${p.supplierName}`.toLowerCase().includes(s)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      const d = parseDate(p.issueDate);
      if (fromDate && d < fromDate) return false;
      if (toDate) { const end = new Date(toDate); end.setHours(23,59,59,999); if (d > end) return false; }
      return true;
    });
  }, [payables, q, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isOverdue = (p: Payable) => p.status === "Vencida";

  const registerPayment = (amount: number) => {
    if (!paying) return;
    setPayables((prev) =>
      prev.map((p) => {
        if (p.id !== paying.id) return p;
        const newPaid = Math.min(p.total, p.paid + amount);
        const status: PayStatus = newPaid >= p.total ? "Pagada" : newPaid > 0 ? "Pago Parcial" : p.status;
        return { ...p, paid: newPaid, status };
      }),
    );
    setPaying(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-brand" />
        <h1 className="text-2xl font-bold text-navy">Cuentas por Pagar</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total deuda proveedores"
          value={formatCurrency(kpis.totalDebt)}
          hint={`${kpis.openCount} facturas abiertas`}
          icon={<Wallet className="h-5 w-5 text-success" />}
          tone="success"
        />
        <KpiCard
          label="Vencimientos a 7 días"
          value={formatCurrency(kpis.soon7Total)}
          hint="Requieren atención inmediata"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          tone="amber"
        />
        <KpiCard
          label="Facturas vencidas"
          value={`${kpis.overdueCount} Facturas en Mora`}
          hint="Pago fuera de término"
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          tone="destructive"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); resetPage(); }}
            placeholder="Buscar por N° de Factura o Proveedor..."
            className="h-10 rounded-full pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); resetPage(); }}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Pago Parcial">Pago Parcial</SelectItem>
            <SelectItem value="Pagada">Pagada</SelectItem>
            <SelectItem value="Vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        <DateField label="Desde" value={fromDate} onChange={(d) => { setFromDate(d); resetPage(); }} />
        <DateField label="Hasta" value={toDate} onChange={(d) => { setToDate(d); resetPage(); }} />
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" className="h-10 rounded-full" onClick={() => { setFromDate(undefined); setToDate(undefined); resetPage(); }}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar fechas
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>N° Factura</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Vínculo OC</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.invoiceNumber}</TableCell>
                <TableCell className="font-medium text-navy">{p.supplierName}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.orderNumber}</TableCell>
                <TableCell className="text-muted-foreground">{p.issueDate}</TableCell>
                <TableCell className={cn("font-medium", isOverdue(p) && "text-destructive")}>{p.dueDate}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{formatCurrency(p.total)}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[p.status])}>
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Ver" onClick={() => setViewing(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-success"
                      title={p.status === "Pagada" ? "Pagada" : "Registrar pago"}
                      disabled={p.status === "Pagada"}
                      onClick={() => setPaying(p)}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Sin resultados.</div>}
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-center">
          <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ViewPayableModal payable={viewing} onClose={() => setViewing(null)} />
      <RegisterPaymentModal payable={paying} onClose={() => setPaying(null)} onSubmit={registerPayment} />
    </div>
  );
}

function KpiCard({ label, value, hint, icon, tone }: {
  label: string; value: string; hint: string; icon: React.ReactNode;
  tone: "success" | "amber" | "destructive";
}) {
  const toneCls = {
    success: "border-success/30 bg-success/5",
    amber: "border-amber-300 bg-amber-50",
    destructive: "border-destructive/30 bg-destructive/5",
  }[tone];
  const valueCls = {
    success: "text-navy",
    amber: "text-amber-700",
    destructive: "text-destructive",
  }[tone];
  return (
    <div className={cn("flex items-start justify-between rounded-xl border p-4", toneCls)}>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={cn("mt-1 text-2xl font-bold", valueCls)}>{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="rounded-lg bg-card p-2 shadow-sm">{icon}</div>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-10 justify-start rounded-full px-4 text-sm font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? `${label}: ${format(value, "dd/MM/yyyy")}` : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

function ViewPayableModal({ payable, onClose }: { payable: Payable | null; onClose: () => void }) {
  if (!payable) return null;
  const saldo = payable.total - payable.paid;
  const neto = Math.round(payable.total / 1.21);
  const iva = payable.total - neto;
  const order = purchaseOrders.find((o) => o.number === payable.orderNumber);

  return (
    <Dialog open={!!payable} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-navy to-navy/90 px-6 py-5 text-navy-foreground">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-80">
                <Receipt className="h-3.5 w-3.5" /> Factura de Proveedor
              </div>
              <div className="mt-1 font-mono text-2xl font-bold">{payable.invoiceNumber}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                <Building2 className="h-3.5 w-3.5" /> {payable.supplierName}
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur",
              payable.status === "Pagada" && "bg-success/20 text-success-foreground ring-1 ring-success/40",
              payable.status === "Pendiente" && "bg-amber-200/20 text-amber-100 ring-1 ring-amber-200/40",
              payable.status === "Pago Parcial" && "bg-sky-200/20 text-sky-100 ring-1 ring-sky-200/40",
              payable.status === "Vencida" && "bg-destructive/20 text-destructive-foreground ring-1 ring-destructive/40",
            )}>● {payable.status}</span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <DialogHeader className="sr-only">
            <DialogTitle>Factura {payable.invoiceNumber}</DialogTitle>
            <DialogDescription>{payable.supplierName}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile icon={<Hash className="h-3.5 w-3.5" />} label="Orden de Compra" value={payable.orderNumber} mono />
            <InfoTile icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Emisión" value={payable.issueDate} />
            <InfoTile icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Vencimiento" value={payable.dueDate}
              tone={payable.status === "Vencida" ? "destructive" : undefined} />
            <InfoTile icon={<FileText className="h-3.5 w-3.5" />} label="Cond. Pago" value="30 días" />
          </div>

          {order && order.items.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs">Artículo</TableHead>
                    <TableHead className="text-center text-xs">Cant.</TableHead>
                    <TableHead className="text-right text-xs">Precio</TableHead>
                    <TableHead className="text-right text-xs">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.slice(0, 6).map((it) => (
                    <TableRow key={it.articleId}>
                      <TableCell>
                        <div className="text-sm font-medium text-navy">{it.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{it.code}</div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">{it.qtyOrdered}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(it.unitPrice)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(it.unitPrice * it.qtyOrdered)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
              <Row label="Subtotal (neto)" value={formatCurrency(neto)} mono />
              <Row label="IVA 21%" value={formatCurrency(iva)} mono />
              <div className="my-2 border-t border-border" />
              <Row label="Total Factura" value={formatCurrency(payable.total)} mono bold />
            </div>
            <div className="space-y-2 rounded-xl border border-success/30 bg-success/5 p-4 text-sm">
              <Row label="Pagado" value={formatCurrency(payable.paid)} mono />
              <div className="my-2 border-t border-success/20" />
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Saldo pendiente</span>
                <span className={cn("font-mono text-2xl font-bold", saldo > 0 ? "text-destructive" : "text-success")}>
                  {formatCurrency(saldo)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            <Button variant="outline" onClick={() => toast.success("Descargando PDF...")}>
              <FileText className="mr-1.5 h-4 w-4" /> Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({ icon, label, value, mono, tone }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean;
  tone?: "destructive";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className={cn("mt-1 text-sm font-semibold text-navy", mono && "font-mono", tone === "destructive" && "text-destructive")}>
        {value}
      </div>
    </div>
  );
}

type PaymentMethod = "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta" | "QR";

const METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  Efectivo: <Banknote className="h-3.5 w-3.5" />,
  Transferencia: <ArrowRightLeft className="h-3.5 w-3.5" />,
  Cheque: <Landmark className="h-3.5 w-3.5" />,
  Tarjeta: <CreditCard className="h-3.5 w-3.5" />,
  QR: <Smartphone className="h-3.5 w-3.5" />,
};

type PayLine = { id: string; method: PaymentMethod; amount: string; reference: string };

function RegisterPaymentModal({ payable, onClose, onSubmit }: {
  payable: Payable | null; onClose: () => void; onSubmit: (amount: number) => void;
}) {
  const [lines, setLines] = useState<PayLine[]>([
    { id: "1", method: "Transferencia", amount: "", reference: "" },
  ]);

  if (!payable) return null;
  const saldo = payable.total - payable.paid;
  const totalPay = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const restante = saldo - totalPay;

  const addLine = () => setLines((prev) => [
    ...prev,
    { id: String(Date.now()), method: "Efectivo", amount: "", reference: "" },
  ]);
  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));
  const updateLine = (id: string, patch: Partial<PayLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPay <= 0) return toast.error("Ingresá al menos un importe");
    if (totalPay > saldo) return toast.error("El total supera el saldo de la factura");
    const summary = lines
      .filter((l) => Number(l.amount) > 0)
      .map((l) => `${l.method}: ${formatCurrency(Number(l.amount))}`)
      .join(" · ");
    onSubmit(totalPay);
    toast.success(`Pago combinado registrado — ${summary}`);
    setLines([{ id: "1", method: "Transferencia", amount: "", reference: "" }]);
  };

  const fillSaldo = (id: string) => updateLine(id, { amount: String(restante + (Number(lines.find((l) => l.id === id)?.amount) || 0)) });

  return (
    <Dialog open={!!payable} onOpenChange={(v) => { if (!v) { onClose(); setLines([{ id: "1", method: "Transferencia", amount: "", reference: "" }]); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy">
            <Banknote className="h-5 w-5 text-success" /> Registrar pago
          </DialogTitle>
          <DialogDescription>
            {payable.invoiceNumber} · {payable.supplierName} · Podés combinar varios métodos de pago
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total Factura</div>
            <div className="mt-1 font-mono text-base font-bold text-navy">{formatCurrency(payable.total)}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ya pagado</div>
            <div className="mt-1 font-mono text-base font-bold text-success">{formatCurrency(payable.paid)}</div>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Saldo</div>
            <div className="mt-1 font-mono text-base font-bold text-destructive">{formatCurrency(saldo)}</div>
          </div>
        </div>

        <form onSubmit={handle} className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Métodos de pago</Label>
            <Button type="button" size="sm" variant="outline" onClick={addLine} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" /> Agregar método
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-12 gap-2 rounded-lg border border-border bg-card p-2.5">
                <div className="col-span-12 sm:col-span-3">
                  <Select value={l.method} onValueChange={(v) => updateLine(l.id, { method: v as PaymentMethod })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Efectivo","Transferencia","Cheque","Tarjeta","QR"] as PaymentMethod[]).map((m) => (
                        <SelectItem key={m} value={m}>
                          <div className="flex items-center gap-2">{METHOD_ICONS[m]} {m}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <Input
                    placeholder={l.method === "Cheque" ? "N° de cheque" : l.method === "Transferencia" ? "CBU / Ref." : "Referencia (opcional)"}
                    value={l.reference}
                    onChange={(e) => updateLine(l.id, { reference: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="col-span-9 sm:col-span-4">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number" min={0} step="0.01"
                      placeholder="0,00"
                      value={l.amount}
                      onChange={(e) => updateLine(l.id, { amount: e.target.value })}
                      className="h-9 pl-6 pr-14 text-right font-mono"
                    />
                    {restante > 0 && (
                      <button type="button" onClick={() => fillSaldo(l.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand hover:bg-brand/10">
                        Saldo
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-3 flex justify-end sm:col-span-1">
                  {lines.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => removeLine(l.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total a pagar</div>
                <div className="font-mono text-lg font-bold text-navy">{formatCurrency(totalPay)}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Restante</div>
                <div className={cn("font-mono text-lg font-bold", restante > 0 ? "text-amber-600" : restante < 0 ? "text-destructive" : "text-success")}>
                  {formatCurrency(Math.abs(restante))}
                </div>
              </div>
            </div>
            {totalPay === saldo && totalPay > 0 && (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">Pago total</span>
            )}
            {totalPay > 0 && totalPay < saldo && (
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">Pago parcial</span>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
              Registrar pago
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(mono && "font-mono", bold && "font-semibold text-navy")}>{value}</span>
    </div>
  );
}
