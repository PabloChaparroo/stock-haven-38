import { useMemo, useState } from "react";
import { ArrowDownUp, ArrowUpDown, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { articles } from "@/lib/mock-data";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticleFormModal } from "@/components/modals/article-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function ArticlesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [stockSort, setStockSort] = useState<"high" | "low" | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let result = s
      ? articles.filter((a) =>
          [a.code, a.name, a.brand, a.category, a.description].join(" ").toLowerCase().includes(s),
        )
      : [...articles];

    if (stockSort) {
      result.sort((a, b) => (stockSort === "high" ? b.stock - a.stock : a.stock - b.stock));
    }

    return result;
  }, [q, stockSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Artículos</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn("gap-2 border-border/70", stockSort && "border-brand text-brand")}
              >
                <Filter className="h-4 w-4" />
                Filtrar
                {stockSort && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-brand" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Ordenar por stock</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setStockSort("high");
                  setPage(1);
                }}
                className={cn(stockSort === "high" && "bg-brand/10 text-navy")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Mayor stock
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStockSort("low");
                  setPage(1);
                }}
                className={cn(stockSort === "low" && "bg-brand/10 text-navy")}
              >
                <ArrowDownUp className="mr-2 h-4 w-4" />
                Menor stock
              </DropdownMenuItem>
              {stockSort && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setStockSort(null);
                      setPage(1);
                    }}
                  >
                    Limpiar filtro
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Agregar Artículo
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por código, nombre, marca o categoría"
          className="h-10 rounded-full pl-10"
        />
      </div>

      <ArticlesTable articles={slice} />

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ArticleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
