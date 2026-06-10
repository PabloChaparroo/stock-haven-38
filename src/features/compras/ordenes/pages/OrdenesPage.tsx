import { useMemo, useState } from "react";
import { Plus, Search, Calendar as CalendarIcon, Eye, Pencil, Send, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { OrderDetailModal } from "@/components/modals/order-detail-modal";
import { OrderFormModal } from "@/components/modals/order-form-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrders, formatCurrency, type PurchaseOrder, type PurchaseOrderStatus } from "@/lib/mock-data";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  Pendiente: "bg-amber-100 text-amber-700",
  Emitida: "bg-sky-100 text-sky-700",
  Recibida: "bg-success/15 text-success",
  Cancelada: "bg-destructive/15 text-destructive",
};

const parseDate = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export function OrdenesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PurchaseOrderStatus>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null);
  const [deleting, setDeleting] = useState<PurchaseOrder | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return purchaseOrders.filter((o) => {
      if (s && !`${o.number} ${o.supplierName}`.toLowerCase().includes(s)) return false;
      if (status !== "all" && o.status !== status) return false;
      const d = parseDate(o.issueDate);
      if (fromDate && d < fromDate) return false;
      if (toDate) {
        const end = new Date(toDate); end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [q, status, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Órdenes de Compra</h1>
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
            {filtered.length}
          </span>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Nueva Orden
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); resetPage(); }}
            placeholder="Buscar por Nro de Orden o Proveedor..."
            className="h-10 rounded-full pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); resetPage(); }}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Emitida">Emitida</SelectItem>
            <SelectItem value="Recibida">Recibida</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
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
              <TableHead>Nro Orden</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Fecha Est. Recepción</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((o) => {
              const isPending = o.status === "Pendiente";
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.number}</TableCell>
                  <TableCell className="font-medium text-navy">{o.supplierName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.issueDate}</TableCell>
                  <TableCell className="text-muted-foreground">{o.expectedDate}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(o.total)}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[o.status])}>
                      ● {o.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Ver" onClick={() => setViewing(o)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title={isPending ? "Editar" : "Sólo lectura"}
                        disabled={!isPending}
                        onClick={() => setEditing(o)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-brand"
                        title={isPending ? "Enviar al proveedor" : "No disponible"}
                        disabled={!isPending}
                        onClick={() => toast.success(`Orden ${o.number} enviada al proveedor`)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title={isPending ? "Eliminar" : "No disponible"}
                        disabled={!isPending}
                        onClick={() => setDeleting(o)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Sin resultados.</div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <OrderFormModal open={createOpen} onOpenChange={setCreateOpen} />
      <OrderFormModal open={!!editing} onOpenChange={(v) => !v && setEditing(null)} />
      <OrderDetailModal open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} order={viewing} />
      <DeleteConfirmModal
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        itemName={`la orden ${deleting?.number ?? ""}`}
        onConfirm={() => {
          toast.success(`Orden ${deleting?.number} eliminada`);
          setDeleting(null);
        }}
      />
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
