import { useMemo, useState } from "react";
import { Eye, Truck, DollarSign, RotateCcw, Search, Calendar as CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sales as initialSales, formatCurrency, type Sale, type SaleStatus, type PaymentMethod } from "@/lib/mock-data";
import { SaleDetailModal } from "@/components/pos/sale-detail-modal";
import { RemitoModal } from "@/components/pos/remito-modal";
import { RegisterPaymentModal } from "@/components/pos/register-payment-modal";
import { CreditNoteModal } from "@/components/pos/credit-note-modal";

type FilterKey = "todas" | SaleStatus;

const pills: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "Pagado", label: "Pagado" },
  { key: "Parcial", label: "Parcial" },
  { key: "Pendiente", label: "Pendiente" },
  { key: "Anulado", label: "Anulado" },
];

const statusClass: Record<SaleStatus, string> = {
  Pagado: "bg-success/15 text-success",
  Parcial: "bg-amber-100 text-amber-700",
  Pendiente: "bg-destructive/10 text-destructive",
  Anulado: "bg-muted text-muted-foreground",
};

const PAGE_SIZE = 8;

// dd/MM/yyyy -> Date
const parseSaleDate = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export function HistorialPage() {
  const [salesList, setSalesList] = useState<Sale[]>(initialSales);
  const [filter, setFilter] = useState<FilterKey>("todas");
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState<Sale | null>(null);
  const [remito, setRemito] = useState<Sale | null>(null);
  const [pay, setPay] = useState<Sale | null>(null);
  const [nc, setNc] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return salesList.filter((sale) => {
      if (filter !== "todas" && sale.status !== filter) return false;
      if (s && !`${sale.number} ${sale.clientName} ${sale.invoiceNumber || ""} ${sale.operator}`.toLowerCase().includes(s)) return false;
      const d = parseSaleDate(sale.date);
      if (fromDate && d < fromDate) return false;
      if (toDate) {
        const end = new Date(toDate); end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [salesList, filter, q, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts: Record<FilterKey, number> = {
    todas: salesList.length,
    Pagado: salesList.filter((s) => s.status === "Pagado").length,
    Parcial: salesList.filter((s) => s.status === "Parcial").length,
    Pendiente: salesList.filter((s) => s.status === "Pendiente").length,
    Anulado: salesList.filter((s) => s.status === "Anulado").length,
  };

  const registerPayment = (sale: Sale, amount: number, method: PaymentMethod) => {
    setSalesList((prev) =>
      prev.map((s) => {
        if (s.id !== sale.id) return s;
        const paid = s.paid + amount;
        const status: SaleStatus = paid >= s.total ? "Pagado" : "Parcial";
        return {
          ...s, paid, status,
          payments: [...s.payments, { method, amount, date: new Date().toLocaleDateString("es-AR") }],
        };
      }),
    );
  };

  const clearDates = () => { setFromDate(undefined); setToDate(undefined); };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Historial de Ventas</h1>
        </div>
        <p className="ml-4 text-sm text-muted-foreground">{filtered.length} ventas encontradas</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar venta, cliente, comprobante, operador..."
            value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="h-10 rounded-full pl-10"
          />
        </div>

        <DateField label="Desde" value={fromDate} onChange={(d) => { setFromDate(d); setPage(1); }} />
        <DateField label="Hasta" value={toDate} onChange={(d) => { setToDate(d); setPage(1); }} />
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" className="h-10 rounded-full" onClick={clearDates}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar fechas
          </Button>
        )}

        <div className="flex flex-wrap gap-1">
          {pills.map((p) => (
            <button
              key={p.key}
              onClick={() => { setFilter(p.key); setPage(1); }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                filter === p.key ? "bg-navy text-navy-foreground" : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {p.label} ({counts[p.key]})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>N° Venta</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-center">Cant.</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead className="text-right">Desc.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((s) => {
              const totalQty = s.items.reduce((a, it) => a + it.quantity, 0);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.number}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">{s.items.map((i) => i.name).join(", ")}</TableCell>
                  <TableCell className="text-center text-sm">{totalQty}</TableCell>
                  <TableCell className="text-sm">{s.clientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.operator}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{s.date}</div>
                    <div className="text-xs">{s.time}</div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {s.discountPercent ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        -{s.discountPercent}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(s.total)}</TableCell>
                  <TableCell className={cn("text-right font-mono", s.paid >= s.total ? "text-success" : s.paid > 0 ? "text-amber-600" : "text-destructive")}>
                    {formatCurrency(s.paid)}
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusClass[s.status])}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-brand" onClick={() => setDetail(s)} title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-navy" onClick={() => setRemito(s)} title="Remito">
                        <Truck className="h-4 w-4" />
                      </Button>
                      {(s.status === "Parcial" || s.status === "Pendiente") && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => setPay(s)} title="Registrar pago">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      {s.status !== "Anulado" && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setNc(s)} title="Devolución / NC">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {pageItems.length === 0 && (
              <TableRow><TableCell colSpan={11} className="py-12 text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SimplePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <SaleDetailModal open={!!detail} onOpenChange={(v) => !v && setDetail(null)} sale={detail} />
      <RemitoModal open={!!remito} onOpenChange={(v) => !v && setRemito(null)} items={remito?.items ?? []} onEmit={() => {}} />
      <RegisterPaymentModal
        open={!!pay}
        onOpenChange={(v) => !v && setPay(null)}
        sale={pay}
        onRegister={(amt, m) => pay && registerPayment(pay, amt, m)}
      />
      <CreditNoteModal open={!!nc} onOpenChange={(v) => !v && setNc(null)} sale={nc} onIssue={() => {}} />
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 justify-start rounded-full px-4 text-sm font-normal",
            !value && "text-muted-foreground",
          )}
        >
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
