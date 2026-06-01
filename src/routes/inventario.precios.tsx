import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Save, Plus, Search, Trash2, Database, ListPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { articles, formatCurrency, type Article } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/inventario/precios")({
  component: PreciosPage,
  head: () => ({ meta: [{ title: "Actualización de Precios — Inventia" }] }),
});

type SavedList = {
  id: string;
  name: string;
  articleIds: string[];
};

const MOCK_LISTS: SavedList[] = [
  { id: "l1", name: "Campaña Escolar", articleIds: ["1", "2", "3", "4", "5"] },
  { id: "l2", name: "Temporada Verano", articleIds: ["6", "7", "8"] },
  { id: "l3", name: "Hardware Importado", articleIds: ["10", "12", "14", "16"] },
];

function PreciosPage() {
  const [lists, setLists] = useState<SavedList[]>(MOCK_LISTS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, string>>({}); // articleId -> nuevo precio (string)
  const [search, setSearch] = useState("");
  const [pctUp, setPctUp] = useState("");
  const [pctDown, setPctDown] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const active = lists.find((l) => l.id === activeId) ?? null;

  const articlesInList = useMemo<Article[]>(() => {
    if (!active) return [];
    return active.articleIds
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is Article => !!a);
  }, [active]);

  const suggestions = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s || !active) return [];
    return articles
      .filter(
        (a) =>
          !active.articleIds.includes(a.id) &&
          (a.name.toLowerCase().includes(s) || a.code.includes(s)),
      )
      .slice(0, 6);
  }, [search, active]);

  const loadList = (id: string) => {
    const l = lists.find((x) => x.id === id);
    if (!l) return;
    setActiveId(id);
    const map: Record<string, string> = {};
    l.articleIds.forEach((aid) => {
      const a = articles.find((x) => x.id === aid);
      if (a) map[aid] = String(a.price);
    });
    setItems(map);
  };

  const createList = () => {
    if (!newName.trim()) return;
    const l: SavedList = { id: `l${Date.now()}`, name: newName.trim(), articleIds: [] };
    setLists((p) => [...p, l]);
    setActiveId(l.id);
    setItems({});
    setNewName("");
    setCreateOpen(false);
    toast.success(`Lista "${l.name}" creada.`);
  };

  const addArticle = (a: Article) => {
    if (!active) return;
    setLists((p) =>
      p.map((l) => (l.id === active.id ? { ...l, articleIds: [...l.articleIds, a.id] } : l)),
    );
    setItems((m) => ({ ...m, [a.id]: String(a.price) }));
    setSearch("");
  };

  const removeArticle = (id: string) => {
    if (!active) return;
    setLists((p) =>
      p.map((l) =>
        l.id === active.id ? { ...l, articleIds: l.articleIds.filter((x) => x !== id) } : l,
      ),
    );
    setItems((m) => {
      const n = { ...m };
      delete n[id];
      return n;
    });
  };

  const applyPercent = (pct: number, direction: 1 | -1) => {
    if (!Number.isFinite(pct) || pct <= 0) return;
    setItems((m) => {
      const n = { ...m };
      articlesInList.forEach((a) => {
        const base = a.price;
        const result = Math.round(base * (1 + (direction * pct) / 100));
        n[a.id] = String(Math.max(0, result));
      });
      return n;
    });
    toast.success(
      `${direction === 1 ? "Aumento" : "Descuento"} de ${pct}% aplicado a ${articlesInList.length} artículos.`,
    );
  };

  const hasDifferences = articlesInList.some((a) => Number(items[a.id]) !== a.price);

  const saveListChanges = () => {
    if (!active) return;
    toast.success(`Cambios guardados en "${active.name}".`);
  };

  const impactDb = () => {
    toast.success("Nuevos precios impactados en la base de datos.");
  };

  return (
    <div className="space-y-5 pb-32">
      {/* Sección 1: Gestión de listas */}
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-brand" />
        <h1 className="text-2xl font-bold text-navy">Actualización por Listas de Precios</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
        <div className="flex flex-1 items-center gap-2 min-w-[280px]">
          <Label className="text-navy font-semibold whitespace-nowrap">Cargar Lista Guardada</Label>
          <Select value={activeId ?? ""} onValueChange={loadList}>
            <SelectTrigger className="h-11 max-w-md border-brand/40 focus:ring-brand">
              <SelectValue placeholder="Seleccionar lista..." />
            </SelectTrigger>
            <SelectContent>
              {lists.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name} ({l.articleIds.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setCreateOpen(true)}
          className="gap-2 border-navy text-navy hover:bg-navy/5"
        >
          <ListPlus className="h-4 w-4" /> Crear Nueva Lista
        </Button>
        <Button
          variant="outline"
          disabled={!active}
          onClick={saveListChanges}
          className="gap-2 border-border/70"
        >
          <Save className="h-4 w-4" /> Guardar cambios en la lista
        </Button>
      </div>

      {/* Sección 2: Workspace */}
      {active ? (
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artículo para agregar a esta lista..."
              className="h-10 rounded-full pl-10"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
                {suggestions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addArticle(a)}
                    className="flex w-full items-center justify-between gap-3 border-b px-4 py-2 text-left last:border-b-0 hover:bg-brand/10"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-navy">{a.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{a.code}</div>
                    </div>
                    <Plus className="h-4 w-4 text-brand" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
              <div className="text-sm font-semibold text-navy">
                {active.name} — {articlesInList.length} Artículo{articlesInList.length !== 1 && "s"}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-navy">Código</TableHead>
                  <TableHead className="text-navy">Nombre</TableHead>
                  <TableHead className="text-navy">Precio Actual</TableHead>
                  <TableHead className="text-navy">Nuevo Precio</TableHead>
                  <TableHead className="text-right text-navy">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articlesInList.map((a) => {
                  const v = items[a.id] ?? String(a.price);
                  const diff = Number(v) !== a.price;
                  return (
                    <TableRow key={a.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{a.code}</TableCell>
                      <TableCell className="font-medium text-navy">{a.name}</TableCell>
                      <TableCell>{formatCurrency(a.price)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={v}
                          onChange={(e) =>
                            setItems((m) => ({ ...m, [a.id]: e.target.value }))
                          }
                          className={`h-9 w-32 focus-visible:ring-brand ${diff ? "border-brand font-semibold text-navy" : ""}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeArticle(a.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {articlesInList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Agregá artículos desde el buscador superior.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/20 py-16 text-center text-muted-foreground">
          Seleccioná o creá una lista para comenzar.
        </div>
      )}

      {/* Sección 3: Footer sticky de acción masiva */}
      {active && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-muted/50 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="flex flex-wrap items-end gap-4 px-6 py-3">
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Aplicar Aumento (%)</Label>
                <Input
                  type="number"
                  min={0}
                  value={pctUp}
                  onChange={(e) => setPctUp(e.target.value)}
                  className="h-9 w-28 focus-visible:ring-brand"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => applyPercent(Number(pctUp), 1)}
                className="h-9 border-brand text-brand hover:bg-brand/10"
              >
                Calcular
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Aplicar Descuento (%)</Label>
                <Input
                  type="number"
                  min={0}
                  value={pctDown}
                  onChange={(e) => setPctDown(e.target.value)}
                  className="h-9 w-28 focus-visible:ring-brand"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => applyPercent(Number(pctDown), -1)}
                className="h-9 border-brand text-brand hover:bg-brand/10"
              >
                Calcular
              </Button>
            </div>

            <div className="ml-auto">
              <Button
                disabled={articlesInList.length === 0 || !hasDifferences}
                onClick={impactDb}
                className="h-11 gap-2 bg-navy px-5 text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
              >
                <Database className="h-4 w-4" /> Impactar Nuevos Precios en Base de Datos
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Crear nueva lista</DialogTitle>
            <DialogDescription>
              Asigná un nombre descriptivo a la lista de precios.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              createList();
            }}
          >
            <div className="space-y-1.5">
              <Label>Nombre de la lista *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Campaña Día del Padre"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
                Crear
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
