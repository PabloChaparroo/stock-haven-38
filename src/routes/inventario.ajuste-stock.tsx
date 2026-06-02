import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Save } from "lucide-react";
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
import { articles } from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CatalogFilter,
  DEFAULT_CATALOG_FILTER,
  filterByStock,
  type CatalogFilterValue,
} from "@/components/catalog-filter";

export const Route = createFileRoute("/inventario/ajuste-stock")({
  component: AjusteStockPage,
  head: () => ({ meta: [{ title: "Ajuste de Stock — Inventia" }] }),
});

const PAGE_SIZE = 12;

type NewStockMap = Record<string, string>; // key: articleId or `${articleId}:${variantId}`

function AjusteStockPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newStock, setNewStock] = useState<NewStockMap>({});
  const [filter, setFilter] = useState<CatalogFilterValue>(DEFAULT_CATALOG_FILTER);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = articles;
    if (s) {
      list = list.filter((a) =>
        [a.code, a.name, a.brand, a.category].join(" ").toLowerCase().includes(s),
      );
    }
    list = filterByStock(list, filter.stock);
    if (filter.status === "inactive") list = [];
    return list;
  }, [q, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasChanges = Object.values(newStock).some((v) => v !== "" && v != null);

  const setVal = (key: string, v: string) =>
    setNewStock((p) => ({ ...p, [key]: v }));

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const handleSave = () => {
    toast.success("Cambios de stock guardados correctamente.");
    setNewStock({});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Ajuste de Stock</h1>
        </div>
        <Button
          disabled={!hasChanges}
          onClick={handleSave}
          className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por código, nombre, marca o categoría"
            className="h-10 rounded-full pl-10"
          />
        </div>
        <CatalogFilter value={filter} onChange={(v) => { setFilter(v); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10" />
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Nombre</TableHead>
              <TableHead className="text-navy">Marca</TableHead>
              <TableHead className="text-navy">Categoría</TableHead>
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
              const low = !hasVariants && a.stock < a.safetyStock;
              return (
                <Fragment key={a.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      {hasVariants && (
                        <button
                          onClick={() => toggle(a.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-navy hover:bg-navy/10"
                        >
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell className="font-medium text-navy">{a.name}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>
                      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-md border bg-muted/40">
                        <img src={a.image} alt={a.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    </TableCell>
                    {hasVariants ? (
                      <>
                        <TableCell className="text-sm text-muted-foreground italic">
                          Ver variantes
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">—</TableCell>
                        <TableCell className="text-sm text-muted-foreground italic">
                          Editar por variante
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold",
                              low
                                ? "bg-destructive/10 text-destructive"
                                : "bg-brand/10 text-navy",
                            )}
                          >
                            {a.stock}
                          </span>
                        </TableCell>
                        <TableCell>{a.safetyStock}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={newStock[a.id] ?? ""}
                            onChange={(e) => setVal(a.id, e.target.value)}
                            placeholder="—"
                            className="h-9 w-24 focus-visible:ring-brand"
                          />
                        </TableCell>
                      </>
                    )}
                  </TableRow>

                  {hasVariants && isOpen && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="py-3">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                            Variantes — {a.name}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-8 text-navy">Código</TableHead>
                                <TableHead className="h-8 text-navy">Variante</TableHead>
                                <TableHead className="h-8 text-navy">Stock Actual</TableHead>
                                <TableHead className="h-8 text-navy">Stock Seg.</TableHead>
                                <TableHead className="h-8 text-navy">Nuevo Stock</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {a.variants!.map((v) => {
                                const vs = a.variantStocks?.find((s) => s.variantId === v.id);
                                const key = `${a.id}:${v.id}`;
                                return (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-mono text-xs">{v.code}</TableCell>
                                    <TableCell className="font-medium text-navy">{v.name}</TableCell>
                                    <TableCell className="font-semibold">{vs?.stock ?? 0}</TableCell>
                                    <TableCell>{vs?.safetyStock ?? "—"}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={newStock[key] ?? ""}
                                        onChange={(e) => setVal(key, e.target.value)}
                                        placeholder="—"
                                        className="h-9 w-24 focus-visible:ring-brand"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
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
