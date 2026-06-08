import { CheckCircle2, Mail, Printer, RotateCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoiceNumber?: string;
  cae?: string;
  total: number;
  email?: string;
  onNewSale: () => void;
};

export function SuccessModal({ open, onOpenChange, invoiceNumber, cae, total, email, onNewSale }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-navy">¡Venta Exitosa!</h2>
          {invoiceNumber && (
            <div className="text-sm text-muted-foreground">
              Factura <span className="font-semibold text-navy">{invoiceNumber}</span>
              {cae && <> · CAE <span className="font-mono">{cae}</span></>}
            </div>
          )}
          <div className="text-4xl font-bold text-brand">{formatCurrency(total)}</div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" className="gap-2"><Printer className="h-4 w-4" /> Ticket</Button>
          <Button variant="outline" className="gap-2" disabled={!email}><Mail className="h-4 w-4" /> Email</Button>
          <Button
            className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => { onNewSale(); onOpenChange(false); }}
          >
            <RotateCcw className="h-4 w-4" /> Nueva Venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
