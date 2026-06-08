import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { pendingOrders, formatCurrency, articles, type PendingOrder, type SaleItem } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLoad: (order: PendingOrder) => void;
};

const PAGE = 12;

export function LoadOrderModal({ open, onOpenChange, onLoad }: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [localOrders, setLocalOrders] = useState<PendingOrder[]>(pendingOrders);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return localOrders;
    return localOrders.filter((o) =>
      [o.number, o.clientName, o.items.map((i) => i.name).join(" ")].join(" ").toLowerCase().includes(s),
    );
  }, [q, localOrders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-navy">Cargar Pedido Pendiente</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, número o artículo"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="h-10 rounded-full pl-10"
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
              <Plus className="h-4 w-4" /> Crear Nuevo Pedido
            </Button>
          </div>

          <div className="grid max-h-[55vh] grid-cols-1 gap-3 overflow-auto md:grid-cols-2 lg:grid-cols-3">
            {slice.map((o) => (
              <button
                key={o.id}
                onClick={() => { onLoad(o); onOpenChange(false); }}
                className="rounded-xl border border-border bg-card p-3 text-left transition hover:border-brand hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand">{o.number}</span>
                  <span className="text-xs text-muted-foreground">{o.date}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-navy">{o.clientName}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </div>
                <div className="mt-2 text-right text-base font-bold text-brand">{formatCurrency(o.total)}</div>
              </button>
            ))}
            {slice.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">No hay pedidos.</div>
            )}
          </div>

          <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </DialogContent>
      </Dialog>

      <CreateOrderModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(o) => setLocalOrders((prev) => [o, ...prev])}
      />
    </>
  );
}

function CreateOrderModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (o: PendingOrder) => void;
}) {
  const [client, setClient] = useState("Consumidor Final");
  const [articleId, setArticleId] = useState(articles[0].id);
  const [qty, setQty] = useState(1);

  const submit = () => {
    const a = articles.find((x) => x.id === articleId)!;
    const item: SaleItem = {
      articleId: a.id, name: a.name, category: a.category, price: a.price / 100, quantity: qty, delivered: 0,
    };
    const order: PendingOrder = {
      id: `o-${Date.now()}`,
      number: `PED-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toLocaleDateString("es-AR"),
      clientName: client || "Consumidor Final",
      items: [item],
      total: item.price * item.quantity,
    };
    onCreate(order);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">Crear Nuevo Pedido</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Cliente</Label>
            <Input value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div>
            <Label>Artículo</Label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {articles.slice(0, 20).map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.price / 100)}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cantidad</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={submit}>Guardar Pedido</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
