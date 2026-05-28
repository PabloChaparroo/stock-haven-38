import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { articles, stockExitReasons, type Article } from "@/lib/mock-data";

export const Route = createFileRoute("/inventario/salida-stock")({
  component: ExitStockPage,
  head: () => ({ meta: [{ title: "Salida de Stock — Inventia" }] }),
});

type ExitRow = { reason: string; qty: string };

function ExitStockPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);
  const [rows, setRows] = useState<Record<string, ExitRow>>({});

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return articles
      .filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s))
      .slice(0, 8);
  }, [q]);

  const variants = selected?.variants ?? [];
  const variantStocks = selected?.variantStocks ?? [];
  // Fallback "single" row if article has no variants
  const usingSingleRow = selected && variants.length === 0;
  const singleKey = "__single__";

  const hasValid = Object.values(rows).some((r) => parseInt(r.qty) > 0 && r.reason);

  const setRow = (id: string, patch: Partial<ExitRow>) =>
    setRows((p) => ({ ...p, [id]: { reason: "", qty: "", ...(p[id] ?? {}), ...patch } }));

  const pickArticle = (a: Article) => {
    setSelected(a);
    setQ("");
    setRows({});
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Registrar Salida de Stock</h1>
        </div>
        <Button
          disabled={!hasValid}
          className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          Guardar Salida
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar artículo por código o nombre para registrar salida..."
            className="h-14 rounded-2xl border-2 pl-12 text-base shadow-sm focus-visible:ring-brand"
          />
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
              {results.map((a) => (
                <button
                  key={a.id}
                  onClick={() => pickArticle(a)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                >
                  <img src={a.image} alt="" className="h-10 w-10 rounded border bg-muted/40 object-contain p-1" />
                  <div className="flex-1">
                    <div className="font-medium text-navy">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{a.code}</span> · {a.brand}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-xl border bg-gradient-to-r from-brand/10 to-transparent p-4">
            <div className="flex items-center gap-3">
              <img src={selected.image} alt="" className="h-14 w-14 rounded-lg border bg-muted/40 object-contain p-1" />
              <div>
                <div className="text-lg font-semibold text-navy">{selected.name}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{selected.code}</span> · {selected.brand}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-navy">{usingSingleRow ? "Artículo" : "Variante"}</TableHead>
                  <TableHead className="text-navy">Stock Actual</TableHead>
                  <TableHead className="text-navy">Motivo de Salida</TableHead>
                  <TableHead className="text-navy">Cantidad a Retirar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usingSingleRow ? (
                  <TableRow>
                    <TableCell className="font-medium text-navy">Único — sin variantes</TableCell>
                    <TableCell className="font-semibold">{selected.stock}</TableCell>
                    <TableCell>
                      <select
                        value={rows[singleKey]?.reason ?? ""}
                        onChange={(e) => setRow(singleKey, { reason: e.target.value })}
                        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="">Seleccionar...</option>
                        {stockExitReasons.map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number" min={0} max={selected.stock}
                        value={rows[singleKey]?.qty ?? ""}
                        onChange={(e) => setRow(singleKey, { qty: e.target.value })}
                        className="h-9 w-28 focus-visible:ring-brand" placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  variants.map((v) => {
                    const vs = variantStocks.find((s) => s.variantId === v.id);
                    const r = rows[v.id];
                    return (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="font-medium text-navy">{v.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{v.code}</div>
                        </TableCell>
                        <TableCell className="font-semibold">{vs?.stock ?? 0}</TableCell>
                        <TableCell>
                          <select
                            value={r?.reason ?? ""}
                            onChange={(e) => setRow(v.id, { reason: e.target.value })}
                            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          >
                            <option value="">Seleccionar...</option>
                            {stockExitReasons.map((re) => (<option key={re} value={re}>{re}</option>))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number" min={0} max={vs?.stock ?? 0}
                            value={r?.qty ?? ""}
                            onChange={(e) => setRow(v.id, { qty: e.target.value })}
                            className="h-9 w-28 focus-visible:ring-brand" placeholder="0"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
