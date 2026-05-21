import { Construction } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-brand" />
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
      </div>
      <Card className="grid place-items-center gap-3 p-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/15 text-brand">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-navy">Módulo en construcción</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Este módulo todavía no está implementado. Lo vamos a desarrollar próximamente.
        </p>
      </Card>
    </div>
  );
}
