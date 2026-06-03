import { Fragment, useState } from "react";
import { Eye, Pencil, Trash2, Link2Off, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatCurrency, type Article } from "@/lib/mock-data";
import { ImageZoomModal } from "@/components/modals/image-zoom-modal";
import { ArticleDetailsModal } from "@/components/modals/article-details-modal";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { cn } from "@/lib/utils";

type Props = {
  articles: Article[];
  onUnlink?: (article: Article) => void;
  unlinkTitle?: string;
  hideDelete?: boolean;
  hideEdit?: boolean;
};

const truncate = (s: string, n = 32) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

export function ArticlesTable({ articles, onUnlink, unlinkTitle = "Desvincular", hideDelete, hideEdit }: Props) {
  const [zoom, setZoom] = useState<Article | null>(null);
  const [details, setDetails] = useState<Article | null>(null);
  const [edit, setEdit] = useState<Article | null>(null);
  const [del, setDel] = useState<Article | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-navy">Código</TableHead>
              <TableHead className="text-navy">Nombre</TableHead>
              <TableHead className="text-navy">Marca</TableHead>
              <TableHead className="text-navy">Precio</TableHead>
              <TableHead className="text-navy">Descripción</TableHead>
              <TableHead className="text-navy">Creación</TableHead>
              <TableHead className="text-navy">Imagen</TableHead>
              <TableHead className="text-navy">Stock</TableHead>
              <TableHead className="text-navy">Stock Seg.</TableHead>
              <TableHead className="text-navy">Categoría</TableHead>
              <TableHead className="text-right text-navy">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((a) => {
              const hasVariants = (a.variants?.length ?? 0) > 0;
              const low = !hasVariants && a.stock < a.safetyStock;
              const isOpen = !!expanded[a.id];
              return (
                <Fragment key={a.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell className="font-medium text-navy">{a.name}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>{formatCurrency(a.price)}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-left text-sm text-foreground underline-offset-2 hover:text-brand hover:underline">
                            {truncate(a.description)}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 border-brand/30 text-sm leading-relaxed">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                            Descripción completa
                          </div>
                          {a.description}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{a.createdAt}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setZoom(a)}
                        className="grid h-10 w-10 place-items-center overflow-hidden rounded-md border bg-muted/40 transition hover:ring-2 hover:ring-brand"
                        aria-label="Ver imagen"
                      >
                        <img src={a.image} alt={a.name} className="max-h-full max-w-full object-contain" />
                      </button>
                    </TableCell>

                    {hasVariants ? (
                      <TableCell colSpan={2}>
                        <button
                          onClick={() => toggle(a.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                            isOpen ? "bg-brand text-brand-foreground" : "bg-navy/10 text-navy hover:bg-navy/15",
                          )}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          {a.variants!.length} variantes
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className={cn("font-semibold", low && "text-destructive")}>{a.stock}</TableCell>
                        <TableCell>{a.safetyStock || <span className="text-muted-foreground">—</span>}</TableCell>
                      </>
                    )}

                    <TableCell>{a.category}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setDetails(a)} className="h-8 w-8 text-navy hover:bg-navy/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!hideEdit && (
                          <Button size="icon" variant="ghost" onClick={() => setEdit(a)} className="h-8 w-8 text-brand hover:bg-brand/10">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {!hideDelete && (
                          <Button size="icon" variant="ghost" onClick={() => setDel(a)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {onUnlink && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title={unlinkTitle}
                            onClick={() => onUnlink(a)}
                            className="h-8 w-8 text-orange-600 hover:bg-orange-500/10"
                          >
                            <Link2Off className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {hasVariants && isOpen && (
                    <TableRow key={`${a.id}-vs`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={11} className="py-3">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                            Stock por variante — {a.name}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-8 text-navy">Código</TableHead>
                                <TableHead className="h-8 text-navy">Variante</TableHead>
                                <TableHead className="h-8 text-navy">Descripción</TableHead>
                                <TableHead className="h-8 text-right text-navy">Stock actual</TableHead>
                                <TableHead className="h-8 text-right text-navy">Stock seguridad</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {a.variants!.map((v) => {
                                const vs = a.variantStocks?.find((s) => s.variantId === v.id);
                                const vlow = vs && vs.safetyStock != null && vs.stock < vs.safetyStock;
                                return (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-mono text-xs">{v.code}</TableCell>
                                    <TableCell className="font-medium text-navy">{v.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{v.description}</TableCell>
                                    <TableCell className={cn("text-right font-semibold", vlow && "text-destructive")}>
                                      {vs?.stock ?? 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {vs?.safetyStock ?? <span className="text-muted-foreground">—</span>}
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
            {articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                  No hay artículos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ImageZoomModal open={!!zoom} onOpenChange={(v) => !v && setZoom(null)} src={zoom?.image} alt={zoom?.name} />
      <ArticleDetailsModal open={!!details} onOpenChange={(v) => !v && setDetails(null)} article={details ?? undefined} />
      <ArticleFormModal open={!!edit} onOpenChange={(v) => !v && setEdit(null)} mode="edit" article={edit ?? undefined} />
      <DeleteConfirmModal
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        itemName={`el artículo "${del?.name}"`}
        onConfirm={() => setDel(null)}
      />
    </>
  );
}
