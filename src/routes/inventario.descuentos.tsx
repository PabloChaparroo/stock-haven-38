import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Percent, Search, Calendar, Link2Off } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  articles,
  discounts as initialDiscounts,
  formatCurrency,
  type Discount,
  type DiscountType,
} from "@/lib/mock-data";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { DiscountFormModal } from "@/components/modals/discount-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { LinkArticlesModal } from "@/components/modals/link-articles-modal";
import { EditQuantityModal } from "@/components/modals/edit-quantity-modal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventario/descuentos")({
  component: DiscountsPage,
  head: () => ({ meta: [{ title: "Descuentos — Inventia" }] }),
});

const PAGE_SIZE = 12;

function DiscountsPage() {
  const [type, setType] = useState<DiscountType>("category");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Discount | null>(null);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Discount | null>(null);
  const [del, setDel] = useState<Discount | null>(null);

  const filtered = useMemo(() => {
    return initialDiscounts.filter(
      (d) =>
        d.type === type &&
        d.active === (statusFilter === "active") &&
        d.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [type, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTypeChange = (t: DiscountType) => {
    setType(t);
    setPage(1);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Descuentos</h1>
        </div>
        <Button onClick={() => setCreate(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Nuevo descuento
        </Button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border bg-muted/40 p-1">
        {[
          { v: "category" as const, label: "Descuento por Categoría" },
          { v: "combo" as const, label: "Descuento por Combo" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => handleTypeChange(t.v)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              type === t.v
                ? "bg-navy text-navy-foreground shadow-sm"
                : "text-muted-foreground hover:text-navy",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar descuento..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as "active" | "inactive"); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slice.map((d) => {
          const active = selected?.id === d.id;
          return (
            <Card
              key={d.id}
              onClick={() => setSelected(d)}
              className={cn(
                "group relative cursor-pointer overflow-hidden p-5 transition",
                active
                  ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/40"
                  : "hover:border-navy/30 hover:shadow-md",
              )}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Percent className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-brand hover:bg-brand/10"
                    onClick={(e) => { e.stopPropagation(); setEdit(d); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setDel(d); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy">{d.name}</h3>
              <div className="my-2 text-3xl font-bold text-brand">{d.percentage}%</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Desde: {d.fromDate}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Hasta: {d.toDate ?? "Sin límite"}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
              {d.type === "category" && d.categoryName && (
                <div className="mt-3 inline-flex rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                  {d.categoryName}
                </div>
              )}
            </Card>
          );
        })}
        {slice.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No hay descuentos para mostrar.
          </div>
        )}
      </div>

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selected && <DetailPanel discount={selected} />}

      <DiscountFormModal open={create} onOpenChange={setCreate} defaultType={type} />
      <DiscountFormModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} mode="edit" discount={edit ?? undefined} />
      <DeleteConfirmModal open={!!del} onOpenChange={(v) => !v && setDel(null)}
        itemName={`el descuento "${del?.name}"`} onConfirm={() => setDel(null)} />
    </div>
  );
}

type ItemRow = (typeof articles)[number] & { _minQty?: number };

function DetailPanel({ discount }: { discount: Discount }) {
  const [artPage, setArtPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [unlink, setUnlink] = useState<ItemRow | null>(null);
  const [editQty, setEditQty] = useState<ItemRow | null>(null);

  const items: ItemRow[] = useMemo(() => {
    if (discount.type === "category") {
      return articles.filter((a) => a.category === discount.categoryName) as ItemRow[];
    }
    const out: ItemRow[] = [];
    for (const c of discount.comboItems ?? []) {
      const art = articles.find((a) => a.id === c.articleId);
      if (art) out.push({ ...art, _minQty: c.minQuantity });
    }
    return out;
  }, [discount]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const slice = items.slice((artPage - 1) * PAGE_SIZE, artPage * PAGE_SIZE);
  const isCombo = discount.type === "combo";

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold text-navy">Artículos en</h2>
          <span className="rounded-full bg-brand/15 px-3 py-0.5 text-sm font-medium text-brand">
            {discount.name}
          </span>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="h-4 w-4" /> Agregar artículo
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Nombre</TableHead>
              {isCombo ? (
                <>
                  <TableHead className="text-navy">Precio Base</TableHead>
                  <TableHead className="text-navy">Cant. Mín. Requerida</TableHead>
                  <TableHead className="text-right text-navy">Acciones</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-navy">Marca</TableHead>
                  <TableHead className="text-navy">Precio Base</TableHead>
                  <TableHead className="text-navy">Precio c/Desc.</TableHead>
                  <TableHead className="text-navy">Categoría</TableHead>
                  <TableHead className="text-right text-navy">Acciones</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((a) => {
              const discounted = Math.round(a.price * (1 - discount.percentage / 100));
              return (
                <TableRow key={a.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{a.code}</TableCell>
                  <TableCell className="font-medium text-navy">{a.name}</TableCell>
                  {isCombo ? (
                    <>
                      <TableCell>{formatCurrency(a.price)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-brand/15 px-3 py-0.5 text-sm font-semibold text-brand">
                          {a._minQty ?? 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar cantidad"
                            onClick={() => setEditQty(a)}
                            className="h-8 w-8 text-brand hover:bg-brand/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Desvincular del combo"
                            onClick={() => setUnlink(a)}
                            className="h-8 w-8 text-orange-600 hover:bg-orange-500/10"
                          >
                            <Link2Off className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Eliminar"
                            onClick={() => setUnlink(a)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{a.brand}</TableCell>
                      <TableCell>{formatCurrency(a.price)}</TableCell>
                      <TableCell className="font-semibold text-brand">{formatCurrency(discounted)}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Desvincular del descuento"
                            onClick={() => setUnlink(a)}
                            className="h-8 w-8 text-orange-600 hover:bg-orange-500/10"
                          >
                            <Link2Off className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
            {slice.length === 0 && (
              <TableRow>
                <TableCell colSpan={isCombo ? 5 : 7} className="py-10 text-center text-muted-foreground">
                  Sin artículos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SimplePagination page={artPage} totalPages={totalPages} onPageChange={setArtPage} />

      <LinkArticlesModal
        open={addOpen}
        onOpenChange={setAddOpen}
        targetLabel={`al descuento "${discount.name}"`}
        excludeIds={items.map((i) => i.id)}
        withQuantity={isCombo}
      />
      <EditQuantityModal
        open={!!editQty}
        onOpenChange={(v) => !v && setEditQty(null)}
        articleName={editQty?.name}
        initialQuantity={editQty?._minQty ?? 1}
        onConfirm={() => setEditQty(null)}
      />
      <DeleteConfirmModal
        open={!!unlink}
        onOpenChange={(v) => !v && setUnlink(null)}
        itemName={`el artículo "${unlink?.name}" de este descuento`}
        onConfirm={() => setUnlink(null)}
      />
    </section>
  );
}
