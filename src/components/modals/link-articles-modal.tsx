import { useMemo, useState, useEffect } from "react";
import { Search, Check, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { articles, formatCurrency } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. 'a la categoría "Periféricos"' */
  targetLabel?: string;
  /** IDs already linked, hidden from the picker */
  excludeIds?: string[];
  /** When confirming a combo, the parent may want default qty */
  withQuantity?: boolean;
  onConfirm?: (selected: { id: string; quantity?: number }[]) => void;
};

export function LinkArticlesModal({
  open,
  onOpenChange,
  targetLabel,
  excludeIds = [],
  withQuantity = false,
  onConfirm,
}: Props) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPicked({});
    }
  }, [open]);

  const available = useMemo(
    () =>
      articles.filter(
        (a) =>
          !excludeIds.includes(a.id) &&
          (a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)),
      ),
    [search, excludeIds],
  );

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = { ...p };
      if (id in n) delete n[id];
      else n[id] = 1;
      return n;
    });

  const setQty = (id: string, q: number) =>
    setPicked((p) => ({ ...p, [id]: Math.max(1, q || 1) }));

  const count = Object.keys(picked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-navy">Agregar artículos</DialogTitle>
          <DialogDescription>
            Buscá y seleccioná uno o varios artículos para vincular{targetLabel ? ` ${targetLabel}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[44vh] rounded-lg border bg-card">
          <ul className="divide-y">
            {available.map((a) => {
              const selected = a.id in picked;
              return (
                <li key={a.id} className={cn("flex items-center gap-3 p-3 transition", selected && "bg-brand/5")}>
                  <button
                    type="button"
                    onClick={() => toggle(a.id)}
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition",
                      selected ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <img src={a.image} alt="" className="h-10 w-10 rounded border bg-muted/40 object-contain p-1" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-navy">{a.name}</div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{a.code}</span>
                      <span>{a.brand}</span>
                      <span>{a.category}</span>
                    </div>
                  </div>
                  <div className="hidden text-sm text-muted-foreground sm:block">{formatCurrency(a.price)}</div>
                  {withQuantity && selected && (
                    <Input
                      type="number"
                      min={1}
                      value={picked[a.id]}
                      onChange={(e) => setQty(a.id, parseInt(e.target.value))}
                      className="h-8 w-20"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </li>
              );
            })}
            {available.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">No hay artículos disponibles.</li>
            )}
          </ul>
        </ScrollArea>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {count > 0 ? (
              <>
                <strong className="text-navy">{count}</strong> artículo{count !== 1 && "s"} seleccionado{count !== 1 && "s"}
              </>
            ) : (
              "Ningún artículo seleccionado"
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="mr-1 h-4 w-4" /> Cancelar
            </Button>
            <Button
              disabled={count === 0}
              onClick={() => {
                onConfirm?.(Object.entries(picked).map(([id, q]) => ({ id, quantity: withQuantity ? q : undefined })));
                onOpenChange(false);
              }}
              className="bg-navy text-navy-foreground hover:bg-navy/90"
            >
              <Plus className="mr-1 h-4 w-4" /> Agregar seleccionados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
