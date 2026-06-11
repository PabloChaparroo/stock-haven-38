import { useMemo, useState } from "react";
import { Search, Calendar as CalendarIcon, X, Eye, CreditCard, Wallet, AlertTriangle, Banknote } from "lucide-react";
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
    toast.success(`Pago de ${formatCurrency(amount)} registrado`);
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
  return (
    <Dialog open={!!payable} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">Factura {payable.invoiceNumber}</DialogTitle>
          <DialogDescription>{payable.supplierName} · OC {payable.orderNumber}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm">
          <Row label="Emisión" value={payable.issueDate} />
          <Row label="Vencimiento" value={payable.dueDate} />
          <Row label="Monto total" value={formatCurrency(payable.total)} mono />
          <Row label="Pagado" value={formatCurrency(payable.paid)} mono />
          <Row label="Saldo" value={formatCurrency(saldo)} mono bold />
          <Row label="Estado" value={payable.status} />
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegisterPaymentModal({ payable, onClose, onSubmit }: {
  payable: Payable | null; onClose: () => void; onSubmit: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Transferencia");
  if (!payable) return null;
  const saldo = payable.total - payable.paid;

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return toast.error("Ingresá un monto válido");
    if (n > saldo) return toast.error("El monto supera el saldo");
    onSubmit(n);
    setAmount("");
  };

  return (
    <Dialog open={!!payable} onOpenChange={(v) => { if (!v) { onClose(); setAmount(""); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy flex items-center gap-2">
            <Banknote className="h-5 w-5 text-success" /> Registrar pago
          </DialogTitle>
          <DialogDescription>
            {payable.invoiceNumber} · {payable.supplierName} · Saldo {formatCurrency(saldo)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Monto *</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(saldo)} />
          </div>
          <div className="space-y-1.5">
            <Label>Método de Pago</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">Registrar</Button>
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
