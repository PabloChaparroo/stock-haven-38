import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { articles, type Article } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/inventario/salida-stock")({
  component: SalidaStockPage,
  head: () => ({ meta: [{ title: "Salida de Stock — Inventia" }] }),
});

const MOTIVOS = ["DAÑADO", "EXTRAVÍO", "PÉRDIDA", "RETIRO", "ROBO"] as const;
type Motivo = (typeof MOTIVOS)[number];

type Row = { motivo: Motivo | ""; cantidad: string };

function SalidaStockPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);
  const [rows, setRows] = useState<Record<string, Row>>({});

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s || selected) return [];
    return articles
      .filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s))
      .slice(0, 6);
  }, [q, selected]);

  const variants = selected?.variants?.length
    ? selected.variants
    : selected
      ? [{ id: "__single", code: selected.code, name: "Único", description: "Sin variantes" }]
      : [];

  const hasValidQty = Object.values(rows).some((r) => Number(r.cantidad) > 0);

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((p) => ({ ...p, [id]: { motivo: "", cantidad: "", ...(p[id] ?? {}), ...patch } }));

  const selectArticle = (a: Article) => {
    setSelected(a);
    setQ("");
    setRows({});
  };

  const clear = () => {
    setSelected(null);
    setRows({});
    setQ("");
  };

  const handleSave = () => {
    toast.success("Salida de stock registrada correctamente.");
    clear();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Registrar Salida de Stock</h1>
        </div>
        <Button
          disabled={!hasValidQty}
          onClick={handleSave}
          className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Guardar Salida
        </Button>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar artículo por código o nombre para registrar salida..."
          className="h-14 rounded-full pl-12 text-base shadow-sm focus-visible:ring-brand"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
            {suggestions.map((a) => (
              <button
                key={a.id}
                onClick={() => selectArticle(a)}
                className="flex w-full items-center gap-3 border-b px-4 py-2.5 text-left last:border-b-0 hover:bg-brand/10"
              >
                <img src={a.image} alt="" className="h-9 w-9 rounded border bg-muted/40 object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-navy">{a.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{a.code} · {a.brand}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-4">
              <img src={selected.image} alt={selected.name} className="h-16 w-16 rounded-lg border bg-muted/40 object-contain p-1" />
              <div>
                <div className="text-lg font-bold text-navy">{selected.name}</div>
                <div className="text-sm text-muted-foreground font-mono">{selected.code} · {selected.brand}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clear} className="text-navy hover:bg-navy/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-navy">Variante</TableHead>
                  <TableHead className="text-navy">Stock Actual</TableHead>
                  <TableHead className="text-navy">Motivo de Salida</TableHead>
                  <TableHead className="text-navy">Cantidad a Retirar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => {
                  const isSingle = v.id === "__single";
                  const stock = isSingle
                    ? selected.stock
                    : selected.variantStocks?.find((s) => s.variantId === v.id)?.stock ?? 0;
                  const row = rows[v.id] ?? { motivo: "", cantidad: "" };
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-navy">{v.name}</TableCell>
                      <TableCell className="font-semibold">{stock}</TableCell>
                      <TableCell>
                        <select
                          value={row.motivo}
                          onChange={(e) => setRow(v.id, { motivo: e.target.value as Motivo })}
                          className="h-9 w-44 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">Seleccionar motivo...</option>
                          {MOTIVOS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={stock}
                          value={row.cantidad}
                          onChange={(e) => setRow(v.id, { cantidad: e.target.value })}
                          placeholder="0"
                          className="h-9 w-28 focus-visible:ring-brand"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!selected && (
        <div className="rounded-xl border border-dashed bg-muted/20 py-16 text-center text-muted-foreground">
          Buscá y seleccioná un artículo para registrar su salida.
        </div>
      )}
    </div>
  );
}
