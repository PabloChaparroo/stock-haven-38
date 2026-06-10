import { useMemo, useState } from "react";
import { Save, Plus, Search, Trash2, Database, ListPlus, AlertTriangle } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { articles, formatCurrency, type Article } from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;



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

type Unit = "percent" | "money";

export function PreciosPage() {
  const [lists, setLists] = useState<SavedList[]>(MOCK_LISTS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [upVal, setUpVal] = useState("");
  const [upUnit, setUpUnit] = useState<Unit>("percent");
  const [downVal, setDownVal] = useState("");
  const [downUnit, setDownUnit] = useState<Unit>("percent");

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSelected, setNewSelected] = useState<string[]>([]);
  const [newSearch, setNewSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSelected, setAddSelected] = useState<string[]>([]);

  const [impactOpen, setImpactOpen] = useState(false);

  const active = lists.find((l) => l.id === activeId) ?? null;

  const articlesInList = useMemo<Article[]>(() => {
    if (!active) return [];
    return active.articleIds
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is Article => !!a);
  }, [active]);

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
    const l: SavedList = {
      id: `l${Date.now()}`,
      name: newName.trim(),
      articleIds: [...newSelected],
    };
    setLists((p) => [...p, l]);
    setActiveId(l.id);
    const map: Record<string, string> = {};
    newSelected.forEach((aid) => {
      const a = articles.find((x) => x.id === aid);
      if (a) map[aid] = String(a.price);
    });
    setItems(map);
    setNewName("");
    setNewSelected([]);
    setNewSearch("");
    setCreateOpen(false);
    toast.success(`Lista "${l.name}" creada con ${l.articleIds.length} artículo(s).`);
  };

  const addArticles = () => {
    if (!active || addSelected.length === 0) return;
    setLists((p) =>
      p.map((l) =>
        l.id === active.id
          ? { ...l, articleIds: [...new Set([...l.articleIds, ...addSelected])] }
          : l,
      ),
    );
    setItems((m) => {
      const n = { ...m };
      addSelected.forEach((aid) => {
        const a = articles.find((x) => x.id === aid);
        if (a && n[aid] == null) n[aid] = String(a.price);
      });
      return n;
    });
    toast.success(`Se agregaron ${addSelected.length} artículo(s).`);
    setAddSelected([]);
    setAddSearch("");
    setAddOpen(false);
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

  const applyAdjustment = (rawVal: number, unit: Unit, direction: 1 | -1) => {
    if (!Number.isFinite(rawVal) || rawVal <= 0) return;
    setItems((m) => {
      const n = { ...m };
      articlesInList.forEach((a) => {
        const base = a.price;
        const result =
          unit === "percent"
            ? Math.round(base * (1 + (direction * rawVal) / 100))
            : base + direction * rawVal;
        n[a.id] = String(Math.max(0, result));
      });
      return n;
    });
    const label = unit === "percent" ? `${rawVal}%` : formatCurrency(rawVal);
    toast.success(
      `${direction === 1 ? "Aumento" : "Descuento"} de ${label} aplicado a ${articlesInList.length} artículos.`,
    );
  };

  const changedRows = useMemo(
    () =>
      articlesInList
        .map((a) => ({ article: a, newPrice: Number(items[a.id] ?? a.price) }))
        .filter((r) => r.newPrice !== r.article.price),
    [articlesInList, items],
  );

  const hasDifferences = changedRows.length > 0;

  const saveListChanges = () => {
    if (!active) return;
    toast.success(`Cambios guardados en "${active.name}".`);
  };

  const impactDb = () => {
    toast.success(`Se impactaron ${changedRows.length} nuevo(s) precio(s) en la base de datos.`);
    setImpactOpen(false);
  };

  // article picker (for both create and add)
  const filterArticles = (q: string, exclude: string[]) => {
    const s = q.trim().toLowerCase();
    return articles
      .filter((a) => !exclude.includes(a.id))
      .filter((a) =>
        !s ? true : [a.code, a.name, a.brand, a.category].join(" ").toLowerCase().includes(s),
      )
      .slice(0, 60);
  };

  return (
    <div className="space-y-5 pb-32">
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

      {active ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2.5">
            <div className="text-sm font-semibold text-navy">
              {active.name} — {articlesInList.length} Artículo{articlesInList.length !== 1 && "s"}
            </div>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90"
            >
              <Plus className="h-4 w-4" /> Agregar Artículo
            </Button>
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
                        onChange={(e) => setItems((m) => ({ ...m, [a.id]: e.target.value }))}
                        className={cn("h-9 w-32 focus-visible:ring-brand", diff && "border-brand font-semibold text-navy")}
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
                    Aún no hay artículos. Agregá artículos con el botón superior.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/20 py-16 text-center text-muted-foreground">
          Seleccioná o creá una lista para comenzar.
        </div>
      )}

      {/* Sticky footer */}
      {active && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-muted/50 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="flex flex-wrap items-end gap-4 px-6 py-3">
            <AdjustBlock
              label="Aplicar Aumento"
              value={upVal}
              setValue={setUpVal}
              unit={upUnit}
              setUnit={setUpUnit}
              onApply={() => applyAdjustment(Number(upVal), upUnit, 1)}
            />
            <AdjustBlock
              label="Aplicar Descuento"
              value={downVal}
              setValue={setDownVal}
              unit={downUnit}
              setUnit={setDownUnit}
              onApply={() => applyAdjustment(Number(downVal), downUnit, -1)}
            />

            <div className="ml-auto">
              <Button
                disabled={articlesInList.length === 0 || !hasDifferences}
                onClick={() => setImpactOpen(true)}
                className="h-11 gap-2 bg-navy px-5 text-navy-foreground hover:bg-navy/90 disabled:opacity-50"
              >
                <Database className="h-4 w-4" /> Impactar Nuevos Precios en Base de Datos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create List modal */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) {
            setNewName("");
            setNewSelected([]);
            setNewSearch("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Crear nueva lista</DialogTitle>
            <DialogDescription>
              Asigná un nombre y seleccioná los artículos a incluir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre de la lista *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Campaña Día del Padre"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Agregar artículos ({newSelected.length} seleccionados)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={newSearch}
                  onChange={(e) => setNewSearch(e.target.value)}
                  placeholder="Buscar por código, nombre, marca o categoría"
                  className="h-10 rounded-full pl-10"
                />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg border">
                {filterArticles(newSearch, []).map((a) => {
                  const checked = newSelected.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm transition last:border-b-0 hover:bg-brand/5",
                        checked && "bg-brand/10",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setNewSelected((p) =>
                            p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id],
                          )
                        }
                      />
                      <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                      <span className="flex-1 font-medium text-navy">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(a.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createList}
              disabled={!newName.trim()}
              className="bg-navy text-navy-foreground hover:bg-navy/90"
            >
              Crear Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add articles to active list */}
      <Dialog
        open={addOpen}
        onOpenChange={(v) => {
          setAddOpen(v);
          if (!v) {
            setAddSelected([]);
            setAddSearch("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Agregar artículos a la lista</DialogTitle>
            <DialogDescription>
              Buscá y seleccioná los artículos que querés sumar a {active?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Buscar por código, nombre, marca o categoría"
                className="h-10 rounded-full pl-10"
              />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border">
              {filterArticles(addSearch, active?.articleIds ?? []).map((a) => {
                const checked = addSelected.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm transition last:border-b-0 hover:bg-brand/5",
                      checked && "bg-brand/10",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setAddSelected((p) =>
                          p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id],
                        )
                      }
                    />
                    <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                    <span className="flex-1 font-medium text-navy">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(a.price)}</span>
                  </label>
                );
              })}
            </div>
            <div className="text-sm text-muted-foreground">{addSelected.length} seleccionados</div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={addArticles}
              disabled={addSelected.length === 0}
              className="bg-navy text-navy-foreground hover:bg-navy/90"
            >
              Agregar {addSelected.length > 0 ? `(${addSelected.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impact confirm */}
      <Dialog open={impactOpen} onOpenChange={setImpactOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-navy">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              ¿Estás seguro que querés impactar los nuevos precios?
            </DialogTitle>
            <DialogDescription>
              Se actualizarán los precios de {changedRows.length} artículo(s) en la base de datos.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-navy">Artículo</TableHead>
                  <TableHead className="text-right text-navy">Precio Actual</TableHead>
                  <TableHead className="text-right text-navy">Nuevo Precio</TableHead>
                  <TableHead className="text-right text-navy">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changedRows.map(({ article: a, newPrice }) => {
                  const delta = newPrice - a.price;
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium text-navy">{a.name}</div>
                        <div className="text-xs font-mono text-muted-foreground">{a.code}</div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(a.price)}</TableCell>
                      <TableCell className="text-right font-semibold text-navy">
                        {formatCurrency(newPrice)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          delta > 0 ? "text-emerald-600" : "text-destructive",
                        )}
                      >
                        {delta > 0 ? "+" : ""}
                        {formatCurrency(delta)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setImpactOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={impactDb} className="bg-navy text-navy-foreground hover:bg-navy/90">
              Confirmar e Impactar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdjustBlock({
  label,
  value,
  setValue,
  unit,
  setUnit,
  onApply,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  unit: Unit;
  setUnit: (u: Unit) => void;
  onApply: () => void;
}) {
  return (
    <div className="flex items-end gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">
          {label} ({unit === "percent" ? "%" : "$"})
        </Label>
        <div className="flex items-center">
          <div className="inline-flex h-9 overflow-hidden rounded-md border">
            <button
              type="button"
              onClick={() => setUnit("percent")}
              className={cn(
                "px-2 text-sm font-semibold transition",
                unit === "percent" ? "bg-brand text-brand-foreground" : "bg-card text-navy hover:bg-muted/40",
              )}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setUnit("money")}
              className={cn(
                "px-2 text-sm font-semibold transition border-l",
                unit === "money" ? "bg-brand text-brand-foreground" : "bg-card text-navy hover:bg-muted/40",
              )}
            >
              $
            </button>
          </div>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="ml-2 h-9 w-28 focus-visible:ring-brand"
            placeholder={unit === "percent" ? "10" : "1000"}
          />
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onApply}
        className="h-9 border-brand text-brand hover:bg-brand/10"
      >
        Calcular
      </Button>
    </div>
  );
}
