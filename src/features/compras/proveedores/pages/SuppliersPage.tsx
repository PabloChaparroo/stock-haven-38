import { useMemo, useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suppliers as allSuppliers } from "@/lib/mock-data";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { SupplierFormModal } from "@/components/modals/supplier-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";



const PAGE_SIZE = 12;

export function SuppliersPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allSuppliers;
    return allSuppliers.filter((sup) =>
      [sup.name, sup.code, sup.cuit, sup.email].join(" ").toLowerCase().includes(s),
    );
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Proveedores</h1>
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar proveedor"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2 border-border/70">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Nuevo Proveedor
          </Button>
        </div>
      </div>

      <SuppliersTable suppliers={slice} />

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SupplierFormModal open={open} onOpenChange={setOpen} mode="create" />
    </div>
  );
}
