import { useMemo, useState } from "react";
import { FileText, Printer, RefreshCw, RotateCcw, Search, Calendar, Zap, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { invoices, pendingInvoiceSales, creditNotes, formatCurrency } from "@/lib/mock-data";

type Tab = "emitidas" | "pendientes" | "nc";

const PAGE_SIZE = 14;

// dd/MM/yyyy -> yyyy-MM-dd para comparar
function toISO(d: string) {
  const [dd, mm, yyyy] = d.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

function inRange(d: string, from: string, to: string) {
  const iso = toISO(d);
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

export function FacturacionPage() {
  const [tab, setTab] = useState<Tab>("emitidas");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDate, setBulkDate] = useState("");

  // reset al cambiar tab/filtros
  const resetPage = () => setPage(1);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filter = (txt: string) => !s || txt.toLowerCase().includes(s);
    if (tab === "emitidas") return invoices.filter((i) => filter(`${i.number} ${i.clientName} ${i.cae}`) && inRange(i.date, from, to));
    if (tab === "pendientes") return pendingInvoiceSales.filter((i) => filter(`${i.number} ${i.clientName}`) && inRange(i.date, from, to));
    return creditNotes.filter((i) => filter(`${i.number} ${i.clientName} ${i.invoiceNumber}`) && inRange(i.date, from, to));
  }, [tab, q, from, to]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingPageIds = tab === "pendientes" ? (pageList as typeof pendingInvoiceSales).map((s) => s.id) : [];
  const allPageSelected = pendingPageIds.length > 0 && pendingPageIds.every((id) => selected.has(id));

  const togglePageAll = () => {
    const next = new Set(selected);
    if (allPageSelected) pendingPageIds.forEach((id) => next.delete(id));
    else pendingPageIds.forEach((id) => next.add(id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const facturarSeleccion = () => {
    if (selected.size === 0) return toast.error("Seleccione al menos una venta");
    toast.success(`Facturando ${selected.size} ventas en AFIP…`);
    setSelected(new Set());
  };

  const facturarPorFecha = () => {
    if (!bulkDate) return toast.error("Seleccione una fecha");
    const [yyyy, mm, dd] = bulkDate.split("-");
    const target = `${dd}/${mm}/${yyyy}`;
    const count = pendingInvoiceSales.filter((s) => s.date === target).length;
    if (count === 0) return toast.error(`No hay ventas pendientes el ${target}`);
    toast.success(`Facturando ${count} ventas del ${target} en AFIP…`);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Facturación</h1>
        </div>
        <p className="ml-4 text-sm text-muted-foreground">{invoices.length} facturas · AFIP / Comprobantes internos</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por número, cliente, CAE..." value={q} onChange={(e) => { setQ(e.target.value); resetPage(); }} className="h-10 rounded-full pl-10" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); resetPage(); }} className="h-7 w-[140px] border-0 p-0 text-xs focus-visible:ring-0" />
          <span className="text-xs text-muted-foreground">→</span>
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); resetPage(); }} className="h-7 w-[140px] border-0 p-0 text-xs focus-visible:ring-0" />
          {(from || to) && (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setFrom(""); setTo(""); resetPage(); }}>Limpiar</Button>
          )}
        </div>
        <div className="flex gap-1">
          {([
            { k: "emitidas", l: `Facturas Emitidas (${invoices.length})` },
            { k: "pendientes", l: `Pendientes (${pendingInvoiceSales.length})` },
            { k: "nc", l: `Notas de Crédito (${creditNotes.length})` },
          ] as { k: Tab; l: string }[]).map((t) => (
            <button
              key={t.k}
              onClick={() => { setTab(t.k); resetPage(); setSelected(new Set()); }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                tab === t.k ? "bg-navy text-navy-foreground" : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === "pendientes" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand" />
            <span className="text-sm font-semibold text-navy">Facturación masiva</span>
          </div>
          <Button size="sm" variant="outline" className="h-8" disabled={selected.size === 0} onClick={facturarSeleccion}>
            <CheckSquare className="mr-1 h-3.5 w-3.5" /> Facturar selección ({selected.size})
          </Button>
          <span className="mx-2 h-5 w-px bg-border" />
          <span className="text-xs text-muted-foreground">o por fecha:</span>
          <Input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="h-8 w-[160px]" />
          <Button size="sm" className="h-8 bg-navy text-navy-foreground hover:bg-navy/90" onClick={facturarPorFecha}>
            <Calendar className="mr-1 h-3.5 w-3.5" /> Facturar todas del día
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {tab === "emitidas" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Tipo</TableHead>
                <TableHead>N° Factura</TableHead>
                <TableHead>PtoVta</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>CAE</TableHead>
                <TableHead>Vence CAE</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pageList as typeof invoices).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-success/15 text-xs font-bold text-success">{inv.type}</span>
                  </TableCell>
                  <TableCell className="font-mono">{inv.type} {inv.pointOfSale}-{inv.number}</TableCell>
                  <TableCell className="font-mono text-xs">{inv.pointOfSale}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{inv.saleNumber}</TableCell>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(inv.total)}</TableCell>
                  <TableCell className="font-mono text-xs">{inv.cae}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.caeDue}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      inv.status === "Emitida" && "bg-success/15 text-success",
                      inv.status === "Con NC" && "bg-amber-100 text-amber-700",
                      inv.status === "Anulada" && "bg-muted text-muted-foreground",
                    )}>{inv.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-brand" title="PDF A4"><FileText className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-navy" title="Ticket 80mm"><Printer className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" title="Consultar AFIP"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === "pendientes" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox checked={allPageSelected} onCheckedChange={togglePageAll} />
                </TableHead>
                <TableHead>N° Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pageList as typeof pendingInvoiceSales).map((s) => (
                <TableRow key={s.id} className={selected.has(s.id) ? "bg-brand/5" : ""}>
                  <TableCell>
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleOne(s.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.number}</TableCell>
                  <TableCell>{s.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.date}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(s.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={() => toast.success(`Facturando ${s.number}…`)}>Facturar AFIP</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === "nc" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>N° NC</TableHead>
                <TableHead>Factura Origen</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pageList as typeof creditNotes).map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs">{n.number}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{n.invoiceNumber}</TableCell>
                  <TableCell>{n.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{n.date}</TableCell>
                  <TableCell className="text-sm">{n.reason}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-destructive">-{formatCurrency(n.total)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-brand"><FileText className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground"><RotateCcw className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {list.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Sin resultados.</div>}
      </div>

      {list.length > 0 && (
        <div className="flex justify-center">
          <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
