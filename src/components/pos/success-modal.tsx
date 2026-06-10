import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Mail, Printer, Receipt, RotateCcw, Send, Truck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoiceNumber?: string;
  cae?: string;
  remitoNumber?: string;
  total: number;
  email?: string;
  onNewSale: () => void;
};

type DocKind = "invoice" | "remito";

export function SuccessModal({ open, onOpenChange, invoiceNumber, cae, remitoNumber, total, email, onNewSale }: Props) {
  const [emailOpen, setEmailOpen] = useState<DocKind | null>(null);
  const [emailValue, setEmailValue] = useState(email ?? "");

  useEffect(() => {
    if (open) {
      setEmailValue(email ?? "");
      setEmailOpen(null);
    }
  }, [open, email]);

  const docs: { kind: DocKind; icon: typeof Receipt; label: string; number: string }[] = [
    ...(invoiceNumber ? [{ kind: "invoice" as DocKind, icon: Receipt, label: "Factura", number: invoiceNumber }] : []),
    ...(remitoNumber ? [{ kind: "remito" as DocKind, icon: Truck, label: "Remito", number: remitoNumber }] : []),
  ];

  const handlePrint = (label: string, number: string) =>
    toast.success(`Imprimiendo ${label} ${number}`);

  const handleSendEmail = (label: string, number: string) => {
    if (!emailValue.trim()) {
      toast.error("Ingresá un correo electrónico");
      return;
    }
    toast.success(`${label} ${number} enviado a ${emailValue}`);
    setEmailOpen(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-navy">¡Venta Exitosa!</h2>
          <div className="text-3xl font-bold text-brand">{formatCurrency(total)}</div>
          {cae && (
            <div className="text-[11px] text-muted-foreground">
              CAE <span className="font-mono">{cae}</span>
            </div>
          )}
        </div>

        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.kind} className="rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase text-muted-foreground">{d.label}</div>
                    <div className="font-mono text-sm font-semibold text-navy">{d.number}</div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePrint(d.label, d.number)}>
                    <Printer className="h-3.5 w-3.5" /> Imprimir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setEmailOpen((v) => (v === d.kind ? null : d.kind))}
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Button>
                </div>
                {emailOpen === d.kind && (
                  <div className="border-t border-border bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        className="h-8 shrink-0 gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
                        onClick={() => handleSendEmail(d.label, d.number)}
                      >
                        <Send className="h-3.5 w-3.5" /> Enviar
                      </Button>
                    </div>
                    {email && emailValue !== email && (
                      <button
                        type="button"
                        onClick={() => setEmailValue(email)}
                        className="mt-1 text-[10px] text-muted-foreground hover:text-brand"
                      >
                        Usar correo del cliente ({email})
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {docs.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
            <FileText className="h-4 w-4" /> No se generaron comprobantes para esta venta.
          </div>
        )}

        <Button
          className="mt-2 w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => { onNewSale(); onOpenChange(false); }}
        >
          <RotateCcw className="h-4 w-4" /> Nueva Venta
        </Button>
      </DialogContent>
    </Dialog>
  );
}
