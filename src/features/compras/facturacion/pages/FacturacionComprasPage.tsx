import { useMemo, useRef, useState } from "react";
import { FileText, Search, Calendar as CalendarIcon, X, Upload, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrders, formatCurrency, type PurchaseOrder } from "@/lib/mock-data";

type Tab = "pendientes" | "facturadas";

const PAGE_SIZE = 10;

const parseDate = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export function FacturacionComprasPage() {
  const [tab, setTab] = useState<Tab>("pendientes");
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const [registering, setRegistering] = useState<PurchaseOrder | null>(null);
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null);

  const resetPage = () => setPage(1);

  // "Pendientes": órdenes recibidas/emitidas sin factura registrada
  // "Facturadas": las que ya tienen invoiceNumber
  const pendientes = useMemo(
    () => purchaseOrders.filter((o) => !o.invoiceNumber && (o.status === "Recibida" || o.status === "Emitida")),
    [],
  );
  const facturadas = useMemo(() => purchaseOrders.filter((o) => !!o.invoiceNumber), []);

  const base = tab === "pendientes" ? pendientes : facturadas;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return base.filter((o) => {
      if (s && !`${o.number} ${o.supplierName} ${o.invoiceNumber ?? ""}`.toLowerCase().includes(s)) return false;
      const d = parseDate(o.issueDate);
      if (fromDate && d < fromDate) return false;
      if (toDate) {
        const end = new Date(toDate); end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [base, q, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Facturación de Compras</h1>
        </div>
        <p className="ml-4 text-sm text-muted-foreground">
          {facturadas.length} facturas registradas · {pendientes.length} órdenes pendientes
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); resetPage(); }}
            placeholder="Buscar por N° orden, proveedor, N° factura..."
            className="h-10 rounded-full pl-10"
          />
        </div>
        <DateField label="Desde" value={fromDate} onChange={(d) => { setFromDate(d); resetPage(); }} />
        <DateField label="Hasta" value={toDate} onChange={(d) => { setToDate(d); resetPage(); }} />
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" className="h-10 rounded-full" onClick={() => { setFromDate(undefined); setToDate(undefined); resetPage(); }}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar fechas
          </Button>
        )}
        <div className="flex gap-1">
          {([
            { k: "pendientes", l: `Pendientes (${pendientes.length})` },
            { k: "facturadas", l: `Facturadas (${facturadas.length})` },
          ] as { k: Tab; l: string }[]).map((t) => (
            <button
              key={t.k}
              onClick={() => { setTab(t.k); resetPage(); }}
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
        {tab === "pendientes" ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>N° Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageList.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.number}</TableCell>
                  <TableCell className="font-medium text-navy">{o.supplierName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.issueDate}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(o.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={() => setRegistering(o)}>
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Registrar Factura
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>N° Factura</TableHead>
                <TableHead>N° Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageList.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">{o.invoiceNumber}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.number}</TableCell>
                  <TableCell className="font-medium text-navy">{o.supplierName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.issueDate}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(o.total)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-brand" title="Ver" onClick={() => setViewing(o)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-navy" title="Descargar PDF" onClick={() => toast.success("Descargando factura...")}>
                        <Download className="h-4 w-4" />
                      </Button>
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

      <RegisterInvoiceModal
        order={registering}
        onClose={() => setRegistering(null)}
        onSubmit={(num) => {
          toast.success(`Factura ${num} registrada para ${registering?.number}`);
          setRegistering(null);
        }}
      />

      <ViewInvoiceModal order={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-10 justify-start rounded-full px-4 text-sm font-normal", !value && "text-muted-foreground")}
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

function RegisterInvoiceModal({
  order,
  onClose,
  onSubmit,
}: {
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (invoiceNumber: string) => void;
}) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) return toast.error("Ingresá el número de factura");
    if (!file) return toast.error("Subí el archivo de la factura");
    onSubmit(invoiceNumber);
    setInvoiceNumber(""); setInvoiceDate(""); setFile(null);
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) { onClose(); setInvoiceNumber(""); setInvoiceDate(""); setFile(null); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">Registrar factura del proveedor</DialogTitle>
          <DialogDescription>
            Orden {order.number} · {order.supplierName} · {formatCurrency(order.total)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>N° de Factura *</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="A 0001-00012345" />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de Factura</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Archivo de Factura *</Label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 py-8 text-sm text-muted-foreground hover:bg-muted"
            >
              <Upload className="h-5 w-5" />
              {file ? file.name : "Subí la factura PDF o imagen del proveedor"}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
              <FileText className="mr-1.5 h-4 w-4" /> Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewInvoiceModal({ order, onClose }: { order: PurchaseOrder | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">Factura {order.invoiceNumber}</DialogTitle>
          <DialogDescription>Orden {order.number} · {order.supplierName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm">
          <Row label="Proveedor" value={order.supplierName} />
          <Row label="CUIT" value={order.supplierCuit} />
          <Row label="Fecha de Emisión" value={order.issueDate} />
          <Row label="Subtotal" value={formatCurrency(order.subtotal)} mono />
          <Row label="IVA" value={formatCurrency(order.taxes)} mono />
          <Row label="Total" value={formatCurrency(order.total)} mono bold />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => toast.success("Descargando factura...")}>
            <Download className="mr-1.5 h-4 w-4" /> Descargar
          </Button>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
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
