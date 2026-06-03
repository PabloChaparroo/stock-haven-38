import { useState } from "react";
import { Plus, Trash2, ImagePlus } from "lucide-react";
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
import { categories as allCategories, brands as allBrands, type Article } from "@/lib/mock-data";
import { SimpleEntityModal } from "./simple-entity-modal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  article?: Article;
};

type LocalVariant = { id: string; code: string; name: string; description: string };

export function ArticleFormModal({ open, onOpenChange, mode = "create", article }: Props) {
  const [hasVariants, setHasVariants] = useState((article?.variants?.length ?? 0) > 0);
  const [variants, setVariants] = useState<LocalVariant[]>(article?.variants ?? []);
  const [description, setDescription] = useState(article?.description ?? "");
  const [openCat, setOpenCat] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);

  const addVariant = () =>
    setVariants((v) => [
      ...v,
      { id: crypto.randomUUID(), code: "", name: "", description: "" },
    ]);

  const removeVariant = (id: string) => setVariants((v) => v.filter((x) => x.id !== id));

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
                  <Select defaultValue={article?.category}>
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
                  <Select defaultValue={article?.brand}>
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
                    Ej: distintas configuraciones, tallas o colores.
                  </div>
                </div>
              </label>

              {hasVariants && (
                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-navy">Variantes</h4>
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
                    {variants.map((v, i) => (
                      <div
                        key={v.id}
                        className="grid gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 md:grid-cols-[110px_1fr_1fr_auto]"
                      >
                        <Input
                          placeholder="Cód."
                          defaultValue={v.code}
                          aria-label={`Código variante ${i + 1}`}
                        />
                        <Input placeholder="Nombre variante" defaultValue={v.name} />
                        <Input placeholder="Descripción" defaultValue={v.description} />
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
                    ))}
                  </div>
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
