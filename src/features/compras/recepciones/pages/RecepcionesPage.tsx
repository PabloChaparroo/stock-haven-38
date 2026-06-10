import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Search, Calendar as CalendarIcon, Eye, Pencil, X, Upload, PackageCheck, StickyNote,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrders, formatCurrency, type PurchaseOrder, type PurchaseOrderItem } from "@/lib/mock-data";

type ReceptionStatus = "En Proceso" | "Confirmada" | "Rechazada";

type ReceptionLine = {
  articleId: string;
  code: string;
  name: string;
  expected: number;
  received: number;
  damaged: number;
  note?: string;
};

type Reception = {
  id: string;
  number: string;
  orderId: string;
  orderNumber: string;
  supplierName: string;
  date: string;
  remito: string;
  status: ReceptionStatus;
  lines: ReceptionLine[];
  observations?: string;
};

const STATUS_STYLES: Record<ReceptionStatus, string> = {
  "En Proceso": "bg-amber-100 text-amber-700",
  Confirmada: "bg-success/15 text-success",
  Rechazada: "bg-destructive/15 text-destructive",
};

const PAGE_SIZE = 10;

// Mock initial data — built from a few purchase orders
const initialReceptions: Reception[] = purchaseOrders
  .filter((o) => o.status === "Recibida" || o.status === "Emitida")
  .slice(0, 6)
  .map((o, i) => ({
    id: `rec-${i + 1}`,
    number: `REC-2026-${String(i + 1).padStart(3, "0")}`,
    orderId: o.id,
    orderNumber: o.number,
    supplierName: o.supplierName,
    date: o.realReceptionDate ?? o.expectedDate,
    remito: o.remitoNumber ?? `RMT-${String(2000 + i)}`,
    status: i === 0 ? "En Proceso" : i === 5 ? "Rechazada" : "Confirmada",
    lines: o.items.map((it) => ({
      articleId: it.articleId, code: it.code, name: it.name,
      expected: it.qtyOrdered, received: it.qtyReceived, damaged: it.qtyDamaged,
    })),
    observations: o.notes,
  }));

const parseDate = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export function RecepcionesPage() {
  const [receptions, setReceptions] = useState<Reception[]>(initialReceptions);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ReceptionStatus>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reception | null>(null);
  const [viewing, setViewing] = useState<Reception | null>(null);

  const resetPage = () => setPage(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return receptions.filter((r) => {
      if (s && !`${r.number} ${r.orderNumber} ${r.supplierName} ${r.remito}`.toLowerCase().includes(s)) return false;
      if (status !== "all" && r.status !== status) return false;
      const d = parseDate(r.date);
      if (fromDate && d < fromDate) return false;
      if (toDate) { const end = new Date(toDate); end.setHours(23,59,59,999); if (d > end) return false; }
      return true;
    });
  }, [receptions, q, status, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const saveReception = (r: Reception) => {
    setReceptions((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id);
      if (idx === -1) return [r, ...prev];
      const next = [...prev]; next[idx] = r; return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Historial de Recepciones</h1>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Nueva Recepción
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); resetPage(); }}
            placeholder="Buscar por N° recepción, OC, proveedor o remito..."
            className="h-10 rounded-full pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); resetPage(); }}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="En Proceso">En Proceso / QC</SelectItem>
            <SelectItem value="Confirmada">Confirmada</SelectItem>
            <SelectItem value="Rechazada">Rechazada</SelectItem>
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
              <TableHead>N° Recepción</TableHead>
              <TableHead>N° OC</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>N° Remito Prov.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.number}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.orderNumber}</TableCell>
                <TableCell className="font-medium text-navy">{r.supplierName}</TableCell>
                <TableCell className="text-muted-foreground">{r.date}</TableCell>
                <TableCell className="font-mono text-xs">{r.remito}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[r.status])}>
                    ● {r.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Ver" onClick={() => setViewing(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      title={r.status === "En Proceso" ? "Editar" : "Solo lectura"}
                      disabled={r.status !== "En Proceso"}
                      onClick={() => { setEditing(r); setFormOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
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

      <ReceptionFormModal
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null); }}
        existing={editing}
        onSave={saveReception}
      />

      <ReceptionViewModal reception={viewing} onClose={() => setViewing(null)} />
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

function ReceptionFormModal({
  open, onOpenChange, existing, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing: Reception | null;
  onSave: (r: Reception) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [comboOpen, setComboOpen] = useState(false);
  const [date, setDate] = useState("");
  const [remito, setRemito] = useState("");
  const [observations, setObservations] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState<ReceptionLine[]>([]);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Initialize from existing
  useEffect(() => {
    if (!open) return;
    if (existing) {
      const o = purchaseOrders.find((p) => p.id === existing.orderId) ?? null;
      setSelectedOrder(o);
      setDate(existing.date);
      setRemito(existing.remito);
      setObservations(existing.observations ?? "");
      setLines(existing.lines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id]);

  const reset = () => {
    setSelectedOrder(null); setDate(""); setRemito(""); setObservations(""); setFile(null); setLines([]);
  };

  const handleSelectOrder = (o: PurchaseOrder) => {
    setSelectedOrder(o);
    setLines(o.items.map((it: PurchaseOrderItem) => ({
      articleId: it.articleId, code: it.code, name: it.name,
      expected: it.qtyOrdered, received: it.qtyOrdered, damaged: 0,
    })));
    setComboOpen(false);
  };

  const updateLine = (id: string, patch: Partial<ReceptionLine>) => {
    setLines((prev) => prev.map((l) => (l.articleId === id ? { ...l, ...patch } : l)));
  };

  const submit = (status: ReceptionStatus) => {
    if (!selectedOrder) return toast.error("Seleccioná una Orden de Compra");
    if (!date) return toast.error("Ingresá la fecha de ingreso");
    if (!remito.trim()) return toast.error("Ingresá el N° de remito");

    const r: Reception = {
      id: existing?.id ?? `rec-${Date.now()}`,
      number: existing?.number ?? `REC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.number,
      supplierName: selectedOrder.supplierName,
      date, remito, status, lines, observations,
    };
    onSave(r);
    toast.success(status === "Confirmada" ? "Recepción confirmada — stock actualizado" : "Borrador guardado");
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">{existing ? "Editar recepción" : "Nueva recepción de mercadería"}</DialogTitle>
          <DialogDescription>Seleccioná una Orden de Compra y registrá lo recibido en depósito.</DialogDescription>
        </DialogHeader>

        {/* OC selector */}
        <div className="space-y-1.5">
          <Label>Orden de Compra *</Label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                {selectedOrder ? (
                  <span className="font-mono text-sm">{selectedOrder.number} — {selectedOrder.supplierName}</span>
                ) : (
                  <span className="text-muted-foreground">Buscar OC recibida o emitida...</span>
                )}
                <Search className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar por N° de orden o proveedor..." />
                <CommandList>
                  <CommandEmpty>Sin resultados.</CommandEmpty>
                  <CommandGroup>
                    {purchaseOrders
                      .filter((o) => o.status === "Emitida" || o.status === "Recibida")
                      .map((o) => (
                        <CommandItem key={o.id} value={`${o.number} ${o.supplierName}`} onSelect={() => handleSelectOrder(o)}>
                          <div className="flex w-full justify-between">
                            <span className="font-mono">{o.number}</span>
                            <span className="text-muted-foreground">{o.supplierName} · {formatCurrency(o.total)}</span>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedOrder && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Fecha de Ingreso *</Label>
                <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="dd/mm/aaaa" />
              </div>
              <div className="space-y-1.5">
                <Label>N° Remito Proveedor *</Label>
                <Input value={remito} onChange={(e) => setRemito(e.target.value)} placeholder="RMT-0001-12345" />
              </div>
              <div className="space-y-1.5">
                <Label>Archivo de Remito</Label>
                <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  {file ? file.name : "Subir remito"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas internas de la recepción..." rows={2} />
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Artículo</TableHead>
                    <TableHead className="text-center">Esperada</TableHead>
                    <TableHead className="text-center">Recibida</TableHead>
                    <TableHead className="text-center">Mermas / Daños</TableHead>
                    <TableHead className="text-right">Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((l) => (
                    <TableRow key={l.articleId}>
                      <TableCell>
                        <div className="font-medium text-navy">{l.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{l.code}</div>
                        {l.note && <div className="mt-1 text-xs text-amber-700">📝 {l.note}</div>}
                      </TableCell>
                      <TableCell className="text-center font-mono">{l.expected}</TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min={0} value={l.received} onChange={(e) => updateLine(l.articleId, { received: Number(e.target.value) })} className="mx-auto h-8 w-20 text-center" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min={0} value={l.damaged} onChange={(e) => updateLine(l.articleId, { damaged: Number(e.target.value) })} className="mx-auto h-8 w-20 text-center" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setNoteFor(l.articleId)}>
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => submit("En Proceso")}>Guardar Borrador</Button>
              <Button className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={() => submit("Confirmada")}>
                <PackageCheck className="mr-1.5 h-4 w-4" /> Confirmar Recepción
              </Button>
            </div>
          </>
        )}

        {/* Note modal for a line */}
        <Dialog open={!!noteFor} onOpenChange={(v) => !v && setNoteFor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nota del artículo</DialogTitle>
            </DialogHeader>
            <Textarea
              value={lines.find((l) => l.articleId === noteFor)?.note ?? ""}
              onChange={(e) => noteFor && updateLine(noteFor, { note: e.target.value })}
              rows={4}
              placeholder="Detalle de daños, faltantes, etc..."
            />
            <div className="flex justify-end">
              <Button onClick={() => setNoteFor(null)}>Listo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function ReceptionViewModal({ reception, onClose }: { reception: Reception | null; onClose: () => void }) {
  if (!reception) return null;
  return (
    <Dialog open={!!reception} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-navy">Recepción {reception.number}</DialogTitle>
          <DialogDescription>
            OC {reception.orderNumber} · {reception.supplierName} · Remito {reception.remito}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[reception.status])}>
            ● {reception.status}
          </span>
          <span className="text-sm text-muted-foreground">Fecha: {reception.date}</span>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Esperada</TableHead>
                <TableHead className="text-center">Recibida</TableHead>
                <TableHead className="text-center">Daños</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reception.lines.map((l) => (
                <TableRow key={l.articleId}>
                  <TableCell>
                    <div className="font-medium text-navy">{l.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{l.code}</div>
                  </TableCell>
                  <TableCell className="text-center font-mono">{l.expected}</TableCell>
                  <TableCell className="text-center font-mono">{l.received}</TableCell>
                  <TableCell className="text-center font-mono">{l.damaged}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {reception.observations && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium text-navy mb-1">Observaciones</div>
            <p className="text-muted-foreground">{reception.observations}</p>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
