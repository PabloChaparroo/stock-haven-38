import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { users as initialUsers } from "@/lib/mock-data";
import { UsersTable } from "@/components/users/users-table";
import { UserFormModal } from "@/components/modals/user-form-modal";

export const Route = createFileRoute("/gestion/usuarios")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Usuarios — Inventia" }] }),
});

function UsersPage() {
  const [create, setCreate] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialUsers;
    return initialUsers.filter((u) =>
      [u.firstName, u.lastName, u.email, u.dni, u.phone].join(" ").toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold text-navy">Usuarios</h1>
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar usuario"
              className="h-10 w-64 rounded-full pl-10"
            />
          </div>
          <Button
            onClick={() => setCreate(true)}
            className="gap-2 bg-navy text-navy-foreground hover:bg-navy/90"
          >
            <Plus className="h-4 w-4" /> Crear usuario
          </Button>
        </div>
      </div>

      <UsersTable users={filtered} />

      <UserFormModal open={create} onOpenChange={setCreate} mode="create" />
    </div>
  );
}
