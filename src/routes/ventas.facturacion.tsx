import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Printer, RefreshCw, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { invoices, pendingInvoiceSales, creditNotes, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/ventas/facturacion")({
  component: FacturacionPage,
  head: () => ({ meta: [{ title: "Facturación — Inventia" }] }),
});

type Tab = "emitidas" | "pendientes" | "nc";

function FacturacionPage() {
  const [tab, setTab] = useState<Tab>("emitidas");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filter = (txt: string) => !s || txt.toLowerCase().includes(s);
    if (tab === "emitidas") return invoices.filter((i) => filter(`${i.number} ${i.clientName} ${i.cae}`));
    if (tab === "pendientes") return pendingInvoiceSales.filter((i) => filter(`${i.number} ${i.clientName}`));
    return creditNotes.filter((i) => filter(`${i.number} ${i.clientName} ${i.invoiceNumber}`));
  }, [tab, q]);

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
          <Input placeholder="Buscar por número, cliente, CAE..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-full pl-10" />
        </div>
        <div className="flex gap-1">
          {([
            { k: "emitidas", l: `Facturas Emitidas (${invoices.length})` },
            { k: "pendientes", l: `Pendientes (${pendingInvoiceSales.length})` },
            { k: "nc", l: `Notas de Crédito (${creditNotes.length})` },
          ] as { k: Tab; l: string }[]).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
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
              {(list as typeof invoices).map((inv) => (
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
                <TableHead>N° Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(list as typeof pendingInvoiceSales).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.number}</TableCell>
                  <TableCell>{s.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.date}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(s.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90">Facturar AFIP</Button>
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
              {(list as typeof creditNotes).map((n) => (
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
    </div>
  );
}
