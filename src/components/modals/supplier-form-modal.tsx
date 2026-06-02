import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Truck, Search, X, Plus, Star } from "lucide-react";
import { articles as allArticles, ivaConditions, type Supplier } from "@/lib/mock-data";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit" | "view";
  supplier?: Supplier;
};

export function SupplierFormModal({ open, onOpenChange, mode = "create", supplier }: Props) {
  const readOnly = mode === "view";
  const [acceptsCheck, setAcceptsCheck] = useState(supplier?.acceptsCheck ?? false);
  const [acceptsCredit, setAcceptsCredit] = useState(supplier?.acceptsCredit ?? false);
  const [rating, setRating] = useState<number>(supplier?.rating ?? 0);
  const [linked, setLinked] = useState<string[]>(supplier?.articleIds ?? []);
  const [search, setSearch] = useState("");
  const [createArticle, setCreateArticle] = useState(false);

  useEffect(() => {
    if (open && supplier) {
      setAcceptsCheck(supplier.acceptsCheck);
      setAcceptsCredit(supplier.acceptsCredit);
      setRating(supplier.rating);
      setLinked(supplier.articleIds ?? []);
    }
    if (open && !supplier) setRating(0);
    if (!open) setSearch("");
  }, [open, supplier]);

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return allArticles
      .filter((a) => !linked.includes(a.id))
      .filter((a) => a.name.toLowerCase().includes(s) || a.code.includes(s))
      .slice(0, 6);
  }, [search, linked]);

  const linkedArticles = useMemo(
    () => allArticles.filter((a) => linked.includes(a.id)),
    [linked],
  );

  const title = mode === "create" ? "Nuevo proveedor" : mode === "edit" ? "Editar proveedor" : "Detalle del proveedor";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-navy">{title}</DialogTitle>
                <DialogDescription>
                  {readOnly ? "Información del proveedor." : "Completá los datos del proveedor."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <section className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre *" defaultValue={supplier?.name} readOnly={readOnly} placeholder="Razón social" />
              <Field label="CUIT *" defaultValue={supplier?.cuit} readOnly={readOnly} placeholder="30-12345678-9" />
              <Field label="Teléfono" defaultValue={supplier?.phone} readOnly={readOnly} placeholder="+54 11 ..." />
              <Field label="Email" type="email" defaultValue={supplier?.email} readOnly={readOnly} placeholder="ventas@..." />
              <Field label="Relación social" defaultValue={supplier?.socialRelation} readOnly={readOnly} placeholder="Ej: Cuenta clave" />
              <div className="space-y-1.5">
                <Label>Condición IVA</Label>
                <Select defaultValue={supplier?.ivaCondition} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {ivaConditions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Field label="Dirección" defaultValue={supplier?.address} readOnly={readOnly} placeholder="Calle, número, ciudad" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Descripción</Label>
                <Textarea defaultValue={supplier?.description} readOnly={readOnly} rows={2} placeholder="Notas internas" />
              </div>
            </section>

            <Separator />

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-navy">¿Acepta cheque?</div>
                </div>
                <Switch checked={acceptsCheck} onCheckedChange={setAcceptsCheck} disabled={readOnly} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-navy">¿Acepta crédito?</div>
                </div>
                <Switch checked={acceptsCredit} onCheckedChange={setAcceptsCredit} disabled={readOnly} />
              </div>
              <Field label="Días de plazo" type="number" defaultValue={supplier?.paymentDays ?? 30} readOnly={readOnly} />
            </section>

            <section className="space-y-2">
              <Label>Calificación inicial</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    disabled={readOnly}
                    onClick={() => setRating(n)}
                    className="p-1 transition hover:scale-110 disabled:hover:scale-100"
                  >
                    <Star className={cn("h-6 w-6", n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-navy">Artículos asociados</h4>
                {!readOnly && (
                  <Button type="button" size="sm" variant="outline" className="border-brand/40 text-brand hover:bg-brand/10" onClick={() => setCreateArticle(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Crear artículo
                  </Button>
                )}
              </div>

              {!readOnly && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    placeholder="Buscar artículo por nombre o código..."
                  />
                  {results.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
                      {results.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setLinked((p) => [...p, a.id]);
                            setSearch("");
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted"
                        >
                          <span className="font-medium text-navy">{a.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {linkedArticles.length === 0 ? (
                <p className="rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
                  No hay artículos vinculados.
                </p>
              ) : (
                <ul className="divide-y rounded-lg border bg-card">
                  {linkedArticles.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                      <img src={a.image} alt="" className="h-9 w-9 rounded border bg-muted/40 object-contain p-1" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-navy">{a.name}</div>
                        <div className="text-xs text-muted-foreground"><span className="font-mono">{a.code}</span> · {a.brand}</div>
                      </div>
                      {!readOnly && (
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setLinked((p) => p.filter((id) => id !== a.id))}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {readOnly ? "Cerrar" : "Cancelar"}
              </Button>
              {!readOnly && (
                <Button type="submit" className="bg-navy text-navy-foreground hover:bg-navy/90">
                  Guardar proveedor
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ArticleFormModal open={createArticle} onOpenChange={setCreateArticle} />
    </>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...rest} />
    </div>
  );
}
