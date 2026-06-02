import { useState, useMemo } from "react";
import { Plus, Trash2, ImagePlus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  categories as allCategories,
  brands as allBrands,
  suppliers as allSuppliers,
  type Article,
} from "@/lib/mock-data";
import { SimpleEntityModal } from "./simple-entity-modal";
import { SupplierFormModal } from "./supplier-form-modal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  article?: Article;
  defaultCategory?: string;
  defaultBrand?: string;
};

type LocalVariant = {
  id: string;
  code: string;
  name: string;
  description: string;
  stock: number;
  safetyStock: number | "";
};

export function ArticleFormModal({
  open,
  onOpenChange,
  mode = "create",
  article,
  defaultCategory,
  defaultBrand,
}: Props) {
  const initialVariants: LocalVariant[] = (article?.variants ?? []).map((v) => {
    const vs = article?.variantStocks?.find((x) => x.variantId === v.id);
    return { ...v, stock: vs?.stock ?? 0, safetyStock: vs?.safetyStock ?? "" };
  });

  const [hasVariants, setHasVariants] = useState((article?.variants?.length ?? 0) > 0);
  const [variants, setVariants] = useState<LocalVariant[]>(initialVariants);
  const [description, setDescription] = useState(article?.description ?? "");
  const [openCat, setOpenCat] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);

  const isEdit = mode === "edit";
  // In edit mode, stock fields are locked UNLESS the user is adding NEW variants
  const hadVariantsAtOpen = (article?.variants?.length ?? 0) > 0;
  const stockLocked = isEdit && (hasVariants === hadVariantsAtOpen) && variants.length === initialVariants.length;

  // Supplier
  const [withSupplier, setWithSupplier] = useState<boolean>(!!article?.supplier);
  const [supplier, setSupplier] = useState<string | undefined>(article?.supplier);
  const [supplierSearch, setSupplierSearch] = useState("");
  const supplierResults = useMemo(() => {
    const s = supplierSearch.trim().toLowerCase();
    if (!s) return allSuppliers.slice(0, 8);
    return allSuppliers.filter((sp) => sp.name.toLowerCase().includes(s) || sp.code.toLowerCase().includes(s));
  }, [supplierSearch]);

  const addVariant = () =>
    setVariants((v) => [
      ...v,
      { id: crypto.randomUUID(), code: "", name: "", description: "", stock: 0, safetyStock: "" },
    ]);

  const removeVariant = (id: string) => setVariants((v) => v.filter((x) => x.id !== id));

  const updateVariant = (id: string, patch: Partial<LocalVariant>) =>
    setVariants((v) => v.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-navy">
              {mode === "create" ? "Agregar artículo" : "Editar artículo"}
            </DialogTitle>
            <DialogDescription>
              Completá los datos. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Código del artículo *</Label>
                <Input defaultValue={article?.code} placeholder="Ej: 123456" />
              </div>
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input defaultValue={article?.name} placeholder="Ej: Notebook T10" />
              </div>
              <div className="space-y-1.5">
                <Label>Precio *</Label>
                <Input type="number" defaultValue={article?.price} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Abreviatura</Label>
                <Input defaultValue={article?.abbreviation} placeholder="Ej: NB" maxLength={6} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>
                  Descripción <span className="text-muted-foreground">({description.length}/50)</span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 50))}
                  placeholder="Descripción breve"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Imagen</Label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 py-6 text-sm text-muted-foreground hover:bg-muted">
                  <ImagePlus className="h-5 w-5" />
                  Arrastrá o seleccioná una imagen
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </section>

            <Separator />

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Categoría *</Label>
                <div className="flex gap-2">
                  <Select defaultValue={article?.category ?? defaultCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-navy/30 text-navy"
                    onClick={() => setOpenCat(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Nueva
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <div className="flex gap-2">
                  <Select defaultValue={article?.brand ?? defaultBrand}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBrands.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-navy/30 text-navy"
                    onClick={() => setOpenBrand(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Nueva
                  </Button>
                </div>
              </div>
            </section>

            <Separator />

            {/* Supplier section */}
            <section className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Checkbox checked={withSupplier} onCheckedChange={(c) => setWithSupplier(Boolean(c))} />
                <div>
                  <div className="font-medium text-navy">Asociar un proveedor</div>
                  <div className="text-xs text-muted-foreground">
                    Buscá y vinculá un proveedor existente para este artículo.
                  </div>
                </div>
              </label>

              {withSupplier && (
                <div className="rounded-xl border bg-card p-4">
                  {supplier ? (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-navy">{supplier}</div>
                        <div className="text-xs text-muted-foreground">Proveedor seleccionado</div>
                      </div>
                      <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setSupplier(undefined)}>
                        <X className="mr-1 h-4 w-4" /> Quitar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={supplierSearch}
                          onChange={(e) => setSupplierSearch(e.target.value)}
                          className="pl-9"
                          placeholder="Buscar proveedor..."
                        />
                      </div>
                      <ul className="max-h-44 divide-y overflow-y-auto rounded-md border">
                        {supplierResults.map((sp) => (
                          <li key={sp.id}>
                            <button
                              type="button"
                              onClick={() => setSupplier(sp.name)}
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted"
                            >
                              <span className="text-sm font-medium text-navy">{sp.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{sp.code}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            <Separator />

            <section className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Checkbox
                  checked={hasVariants}
                  onCheckedChange={(c) => {
                    const v = Boolean(c);
                    setHasVariants(v);
                    if (v && variants.length === 0) addVariant();
                  }}
                />
                <div>
                  <div className="font-medium text-navy">Este artículo tiene variantes</div>
                  <div className="text-xs text-muted-foreground">
                    Ej: distintas configuraciones, tallas o colores. Cada variante tiene su propio stock.
                  </div>
                </div>
              </label>

              {hasVariants ? (
                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-navy">Variantes y stock</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addVariant}
                      className="border-brand/40 text-brand hover:bg-brand/10"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Agregar variante
                    </Button>
                  </div>

                  {variants.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aún no agregaste variantes.</p>
                  )}

                  <div className="space-y-3">
                    {variants.map((v, i) => {
                      const isNew = !initialVariants.some((iv) => iv.id === v.id);
                      const lock = stockLocked && !isNew;
                      return (
                        <div
                          key={v.id}
                          className="grid gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 md:grid-cols-[90px_1fr_1fr_90px_100px_auto]"
                        >
                          <Input
                            placeholder="Cód."
                            value={v.code}
                            onChange={(e) => updateVariant(v.id, { code: e.target.value })}
                            aria-label={`Código variante ${i + 1}`}
                          />
                          <Input
                            placeholder="Nombre variante"
                            value={v.name}
                            onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Descripción"
                            value={v.description}
                            onChange={(e) => updateVariant(v.id, { description: e.target.value })}
                          />
                          <Input
                            type="number"
                            placeholder="Stock"
                            value={v.stock}
                            disabled={lock}
                            onChange={(e) => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })}
                            title="Stock actual"
                          />
                          <Input
                            type="number"
                            placeholder="Stock mín."
                            value={v.safetyStock}
                            disabled={lock}
                            onChange={(e) =>
                              updateVariant(v.id, {
                                safetyStock: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                              })
                            }
                            title="Stock de seguridad"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(v.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Stock actual</Label>
                    <Input
                      type="number"
                      defaultValue={article?.stock ?? 0}
                      placeholder="0"
                      disabled={stockLocked}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Stock de seguridad (mínimo)</Label>
                    <Input
                      type="number"
                      defaultValue={article?.safetyStock ?? ""}
                      placeholder="Opcional"
                      disabled={stockLocked}
                    />
                  </div>
                  {stockLocked && (
                    <p className="md:col-span-2 text-xs text-muted-foreground">
                      Solo se puede modificar el stock al agregar una variante nueva.
                    </p>
                  )}
                </div>
              )}
            </section>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Descartar
              </Button>
              <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
                {mode === "create" ? "Crear artículo" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SimpleEntityModal open={openCat} onOpenChange={setOpenCat} entity="Categoría" />
      <SimpleEntityModal open={openBrand} onOpenChange={setOpenBrand} entity="Marca" />
    </>
  );
}
