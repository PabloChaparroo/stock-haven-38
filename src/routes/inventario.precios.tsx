import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { articles, formatCurrency, priceLists, type PriceList } from "@/lib/mock-data";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/inventario/precios")({
  component: PriceListsPage,
  head: () => ({ meta: [{ title: "Actualización de Precios — Inventia" }] }),
});

type WorkingItem = { articleId: string; currentPrice: number; newPrice: string };

function PriceListsPage() {
  const [lists, setLists] = useState<PriceList[]>(priceLists);
  const [selectedId, setSelectedId] = useState<string>(priceLists[0]?.id ?? "");
  const [items, setItems] = useState<WorkingItem[]>(loadItems(priceLists[0]));
  const [search, setSearch] = useState("");
  const [bumpUp, setBumpUp] = useState("");
  const [bumpDown, setBumpDown] = useState("");
  const [newListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  function loadItems(list?: PriceList): WorkingItem[] {
    if (!list) return [];
    return list.items
      .map((it) => {
        const a = articles.find((x) => x.id === it.articleId);
        if (!a) return null;
        return { articleId: a.id, currentPrice: a.price, newPrice: String(it.newPrice) };
      })
      .filter(Boolean) as WorkingItem[];
  }

  const selected = lists.find((l) => l.id === selectedId);

  const pickList = (id: string) => {
    setSelectedId(id);
    setItems(loadItems(lists.find((l) => l.id === id)));
  };

  const filteredSearch = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return articles
      .filter((a) => !items.some((i) => i.articleId === a.id))
      .filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s))
      .slice(0, 6);
  }, [search, items]);

  const addArticle = (id: string) => {
    const a = articles.find((x) => x.id === id);
    if (!a) return;
    setItems((p) => [...p, { articleId: a.id, currentPrice: a.price, newPrice: String(a.price) }]);
    setSearch("");
  };

  const removeArticle = (id: string) => setItems((p) => p.filter((i) => i.articleId !== id));

  const setNewPrice = (id: string, v: string) =>
    setItems((p) => p.map((i) => (i.articleId === id ? { ...i, newPrice: v } : i)));

  const applyBump = (pct: number) => {
    setItems((p) =>
      p.map((i) => ({ ...i, newPrice: String(Math.round(i.currentPrice * (1 + pct / 100))) })),
    );
  };

  const hasDiff = items.some((i) => Number(i.newPrice) !== i.currentPrice);

  const createList = () => {
    if (!newListName.trim()) return;
    const id = `pl-${Date.now()}`;
    const list: PriceList = { id, name: newListName.trim(), items: [] };
    setLists((p) => [...p, list]);
    setSelectedId(id);
    setItems([]);
    setNewListName("");
    setNewListOpen(false);
  };

  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="text-2xl font-bold text-navy">
          <span className="mr-3 inline-block h-7 w-1.5 rounded-full bg-brand align-middle" />
          Actualización por Listas de Precios
        </h1>
      </div>

      {/* Sección 1: Gestión de listas */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <div className="flex-1 min-w-[260px] space-y-1">
          <Label className="text-xs text-muted-foreground">Cargar Lista Guardada</Label>
          <Select value={selectedId} onValueChange={pickList}>
            <SelectTrigger className="h-11 text-base font-semibold text-navy">
              <SelectValue placeholder="Seleccionar lista..." />
            </SelectTrigger>
            <SelectContent>
              {lists.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2 border-navy/40 text-navy" onClick={() => setNewListOpen(true)}>
          <Plus className="h-4 w-4" /> Crear Nueva Lista
        </Button>
        <Button variant="outline" className="gap-2 border-navy/40 text-navy" title="Guardar cambios en la lista">
          <Save className="h-4 w-4" /> Guardar cambios en la lista
        </Button>
      </div>

      {/* Sección 2: Constructor */}
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy">
            {selected?.name ?? "Lista"} — {items.length} Artículo{items.length !== 1 && "s"}
          </h2>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículo para agregar a esta lista..."
            className="pl-9"
          />
          {filteredSearch.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
              {filteredSearch.map((a) => (
                <button
                  key={a.id}
                  onClick={() => addArticle(a.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted"
                >
                  <span className="font-medium text-navy">{a.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border">
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
              {items.map((i) => {
                const a = articles.find((x) => x.id === i.articleId)!;
                const diff = Number(i.newPrice) !== i.currentPrice;
                return (
                  <TableRow key={i.articleId}>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell className="font-medium text-navy">{a.name}</TableCell>
                    <TableCell>{formatCurrency(i.currentPrice)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={i.newPrice}
                        onChange={(e) => setNewPrice(i.articleId, e.target.value)}
                        className={`h-9 w-36 focus-visible:ring-brand ${diff ? "border-brand" : ""}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeArticle(i.articleId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Lista vacía — buscá un artículo para empezar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sección 3: Footer sticky */}
      <div className="sticky bottom-0 z-20 flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-muted/60 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Aplicar Aumento (%)</Label>
            <div className="flex gap-2">
              <Input
                type="number" value={bumpUp} onChange={(e) => setBumpUp(e.target.value)}
                placeholder="10" className="h-9 w-24"
              />
              <Button
                variant="outline" className="border-brand/40 text-brand hover:bg-brand/10"
                onClick={() => bumpUp && applyBump(Math.abs(Number(bumpUp)))}
              >
                Calcular
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Aplicar Descuento (%)</Label>
            <div className="flex gap-2">
              <Input
                type="number" value={bumpDown} onChange={(e) => setBumpDown(e.target.value)}
                placeholder="5" className="h-9 w-24"
              />
              <Button
                variant="outline" className="border-brand/40 text-brand hover:bg-brand/10"
                onClick={() => bumpDown && applyBump(-Math.abs(Number(bumpDown)))}
              >
                Calcular
              </Button>
            </div>
          </div>
        </div>
        <Button
          disabled={items.length === 0 || !hasDiff}
          className="bg-navy text-navy-foreground hover:bg-navy/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          Impactar Nuevos Precios en Base de Datos
        </Button>
      </div>

      <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">Crear Nueva Lista</DialogTitle>
            <DialogDescription>Asigná un nombre a la nueva lista de precios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Ej: Campaña Invierno" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setNewListOpen(false)}>Cancelar</Button>
            <Button onClick={createList} className="bg-navy text-navy-foreground hover:bg-navy/90">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
