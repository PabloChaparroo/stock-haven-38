import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clients as allClients } from "@/lib/mock-data";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientFormModal } from "@/components/modals/client-form-modal";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { cn } from "@/lib/utils";



const PAGE_SIZE = 10;
type StatusFilter = "active" | "inactive";

export function ClientsPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return allClients
      .filter((c) => (status === "active" ? c.active : !c.active))
      .filter((c) =>
        !s
          ? true
          : [c.firstName, c.lastName, c.number, c.dni, c.email].join(" ").toLowerCase().includes(s),
      );
  }, [q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Gestión de Clientes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border bg-card p-1">
            {(["active", "inactive"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition",
                  status === s ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-navy",
                )}
              >
                {s === "active" ? "Activos" : "Inactivos"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      <ClientsTable clients={slice} />

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ClientFormModal open={open} onOpenChange={setOpen} mode="create" />
    </div>
  );
}
