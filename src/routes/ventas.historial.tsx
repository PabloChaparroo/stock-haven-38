import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Truck, DollarSign, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { sales as initialSales, formatCurrency, type Sale, type SaleStatus, type PaymentMethod } from "@/lib/mock-data";
import { SaleDetailModal } from "@/components/pos/sale-detail-modal";
import { RemitoModal } from "@/components/pos/remito-modal";
import { RegisterPaymentModal } from "@/components/pos/register-payment-modal";
import { CreditNoteModal } from "@/components/pos/credit-note-modal";

export const Route = createFileRoute("/ventas/historial")({
  component: HistorialPage,
  head: () => ({ meta: [{ title: "Historial de Ventas — Inventia" }] }),
});

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

function HistorialPage() {
  const [salesList, setSalesList] = useState<Sale[]>(initialSales);
  const [filter, setFilter] = useState<FilterKey>("todas");
  const [q, setQ] = useState("");

  const [detail, setDetail] = useState<Sale | null>(null);
  const [remito, setRemito] = useState<Sale | null>(null);
  const [pay, setPay] = useState<Sale | null>(null);
  const [nc, setNc] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return salesList.filter((sale) => {
      if (filter !== "todas" && sale.status !== filter) return false;
      if (!s) return true;
      return `${sale.number} ${sale.clientName} ${sale.invoiceNumber || ""}`.toLowerCase().includes(s);
    });
  }, [salesList, filter, q]);

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
            placeholder="Buscar venta, cliente, comprobante..."
            value={q} onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-full pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {pills.map((p) => (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
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
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.number}</TableCell>
                <TableCell className="max-w-[280px] truncate text-sm">{s.items.map((i) => i.name).join(", ")}</TableCell>
                <TableCell className="text-sm">{s.clientName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.date}</TableCell>
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
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
