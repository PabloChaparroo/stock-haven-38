import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function SimplePagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  // Build compact page list with ellipsis-like jumps
  const pages: number[] = [];
  const push = (n: number) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };
  push(1);
  push(page - 1);
  push(page);
  push(page + 1);
  push(totalPages);
  pages.sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-sm font-medium transition",
                page === p
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          </span>
        );
      })}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
