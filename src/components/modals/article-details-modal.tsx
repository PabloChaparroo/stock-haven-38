import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, type Article } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article;
};

export function ArticleDetailsModal({ open, onOpenChange, article }: Props) {
  if (!article) return null;
  const lowStock = article.stock < article.safetyStock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="bg-header-gradient px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-navy/10 text-navy">
                {article.code}
              </Badge>
              <Badge className="bg-brand text-brand-foreground">{article.category}</Badge>
            </div>
            <DialogTitle className="mt-2 text-2xl text-navy">{article.name}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[180px_1fr]">
          <div className="grid h-44 w-44 place-items-center overflow-hidden rounded-2xl border bg-muted/40">
            <img src={article.image} alt={article.name} className="max-h-full max-w-full object-contain" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Marca" value={article.brand} />
              <Field label="Abreviatura" value={article.abbreviation} />
              <Field label="Precio" value={formatCurrency(article.price)} />
              <Field label="Creación" value={article.createdAt} />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Stock actual</div>
                <div className={`text-lg font-semibold ${lowStock ? "text-destructive" : "text-navy"}`}>
                  {article.stock}
                </div>
              </div>
              <Field label="Stock de seguridad" value={String(article.safetyStock)} />
            </div>

            <Separator />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Descripción</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{article.description}</p>
            </div>

            {article.variants && article.variants.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Variantes
                  </div>
                  <div className="space-y-2">
                    {article.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 text-sm"
                      >
                        <Badge variant="outline">{v.code}</Badge>
                        <span className="font-medium text-navy">{v.name}</span>
                        <span className="text-muted-foreground">— {v.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-navy">{value}</div>
    </div>
  );
}
