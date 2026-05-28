import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Filter, Search, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { articles } from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/ajuste-stock")({
  component: AdjustStockPage,
  head: () => ({ meta: [{ title: "Ajuste de Stock — Inventia" }] }),
});

const PAGE_SIZE = 12;

function AdjustStockPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // map: articleId|variantId? => new value (string)
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return articles;
    return articles.filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s) || a.brand.toLowerCase().includes(s));
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasChanges = Object.values(newValues).some((v) => v.trim() !== "");
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const setVal = (key: string, v: string) => setNewValues((p) => ({ ...p, [key]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Ajuste de Stock</h1>
        </div>
        <Button
          disabled={!hasChanges}
          className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          Guardar Cambios
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar artículo por nombre o código..."
            className="h-10 rounded-full pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-border/70">
          <Filter className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-8 text-navy" />
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Nombre</TableHead>
              <TableHead className="text-navy">Marca</TableHead>
              <TableHead className="text-navy">Imagen</TableHead>
              <TableHead className="text-navy">Stock Actual</TableHead>
              <TableHead className="text-navy">Stock Seg.</TableHead>
              <TableHead className="text-navy">Nuevo Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((a) => {
              const hasVariants = (a.variants?.length ?? 0) > 0;
              const isOpen = !!expanded[a.id];
              const totalStock = hasVariants
                ? (a.variantStocks ?? []).reduce((s, v) => s + (v.stock || 0), 0)
                : a.stock;
              return (
                <Fragment key={a.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="w-8 p-2">
                      {hasVariants ? (
                        <button
                          onClick={() => toggle(a.id)}
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-md transition",
                            isOpen ? "bg-brand text-brand-foreground" : "bg-brand/10 text-brand hover:bg-brand/20",
                          )}
                          aria-label="Variantes"
                        >
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                        </button>
                      ) : (
                        <span className="grid h-7 w-7 place-items-center text-muted-foreground/40">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell className="font-medium text-navy">{a.name}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>
                      <img src={a.image} alt="" className="h-10 w-10 rounded border bg-muted/40 object-contain p-1" />
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-navy">{totalStock}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {hasVariants ? "—" : (a.safetyStock || "—")}
                    </TableCell>
                    <TableCell>
                      {hasVariants ? (
                        <span className="text-xs italic text-muted-foreground">Editar por variante</span>
                      ) : (
                        <Input
                          type="number"
                          value={newValues[a.id] ?? ""}
                          onChange={(e) => setVal(a.id, e.target.value)}
                          placeholder="0"
                          className="h-9 w-28 focus-visible:ring-brand"
                        />
                      )}
                    </TableCell>
                  </TableRow>

                  {hasVariants && isOpen && a.variants!.map((v) => {
                    const vs = a.variantStocks?.find((s) => s.variantId === v.id);
                    const key = `${a.id}:${v.id}`;
                    return (
                      <TableRow key={key} className="bg-muted/15 hover:bg-muted/25">
                        <TableCell />
                        <TableCell className="font-mono text-xs pl-6">{v.code}</TableCell>
                        <TableCell colSpan={3} className="text-sm text-muted-foreground">↳ {v.name}</TableCell>
                        <TableCell className="font-semibold">{vs?.stock ?? 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{vs?.safetyStock ?? "—"}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={newValues[key] ?? ""}
                            onChange={(e) => setVal(key, e.target.value)}
                            placeholder="0"
                            className="h-9 w-28 focus-visible:ring-brand"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
