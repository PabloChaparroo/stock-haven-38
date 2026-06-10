import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ShoppingCart, Search, X } from "lucide-react";
import { toast } from "sonner";
import { articles as allArticles, suppliers, formatCurrency, type PurchaseOrder, type PurchaseOrderItem } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: "create" | "edit";
  order?: PurchaseOrder;
};

export function OrderFormModal({ open, onOpenChange, mode = "create", order }: Props) {
  const [supplierId, setSupplierId] = useState(order?.supplierId ?? "");
  const [issueDate, setIssueDate] = useState(order?.issueDate ?? "");
  const [expectedDate, setExpectedDate] = useState(order?.expectedDate ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [items, setItems] = useState<PurchaseOrderItem[]>(order?.items ?? []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && order) {
      setSupplierId(order.supplierId);
      setIssueDate(order.issueDate);
      setExpectedDate(order.expectedDate);
      setNotes(order.notes ?? "");
      setItems(order.items);
    }
    if (!open) setSearch("");
  }, [open, order]);

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return allArticles
      .filter((a) => !items.some((it) => it.articleId === a.id))
      .filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s))
      .slice(0, 6);
  }, [search, items]);

  const addArticle = (a: typeof allArticles[number]) => {
    setItems((p) => [
      ...p,
      {
        articleId: a.id,
        code: a.code,
        name: a.name,
        variant: a.variants?.[0]?.name,
        unitPrice: Math.round(a.price / 100) * 100,
        qtyOrdered: 1,
        qtyReceived: 0,
        qtyDamaged: 0,
      },
    ]);
    setSearch("");
  };

  const updateItem = (id: string, patch: Partial<PurchaseOrderItem>) =>
    setItems((p) => p.map((it) => (it.articleId === id ? { ...it, ...patch } : it)));

  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.articleId !== id));

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qtyOrdered, 0);
  const taxes = Math.round(subtotal * 0.21);
  const total = subtotal + taxes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-navy">{mode === "create" ? "Nueva Orden de Compra" : `Editar ${order?.number}`}</DialogTitle>
              <DialogDescription>Completá los datos de la orden y agregá los artículos.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!supplierId) return toast.error("Seleccioná un proveedor");
            if (items.length === 0) return toast.error("Agregá al menos un artículo");
            toast.success(mode === "create" ? "Orden creada" : "Orden actualizada");
            onOpenChange(false);
          }}
        >
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Proveedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — {s.cuit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de emisión *</Label>
              <Input value={issueDate} onChange={(e) => setIssueDate(e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha est. recepción *</Label>
              <Input value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-navy">Artículos</h4>
              <span className="text-xs text-muted-foreground">{items.length} ítem(s)</span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar artículo por nombre o código..." />
              {results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
                  {results.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => addArticle(a)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted"
                    >
                      <span className="font-medium text-navy">{a.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
                Aún no agregaste artículos.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Artículo</TableHead>
                      <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                      <TableHead className="w-24 text-center">Cantidad</TableHead>
                      <TableHead className="w-32 text-right">Subtotal</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.articleId}>
                        <TableCell>
                          <div className="font-medium text-navy">{it.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{it.code}{it.variant ? ` · ${it.variant}` : ""}</div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={it.unitPrice}
                            onChange={(e) => updateItem(it.articleId, { unitPrice: Number(e.target.value) || 0 })}
                            className="h-8 text-right font-mono"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={it.qtyOrdered}
                            onChange={(e) => updateItem(it.articleId, { qtyOrdered: Math.max(1, Number(e.target.value) || 1) })}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(it.unitPrice * it.qtyOrdered)}
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(it.articleId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section className="ml-auto w-full max-w-xs rounded-xl border bg-muted/30 p-3">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            <Row label="Impuestos (21%)" value={formatCurrency(taxes)} />
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="text-sm font-bold text-navy">Total</span>
              <span className="font-mono text-lg font-bold text-brand">{formatCurrency(total)}</span>
            </div>
          </section>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observaciones internas" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
              <Plus className="mr-1 h-4 w-4" /> {mode === "create" ? "Crear orden" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
