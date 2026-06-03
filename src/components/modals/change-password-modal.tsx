import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const rules = [
  { id: "len", label: "Mínimo 8 caracteres", test: (s: string) => s.length >= 8 },
  { id: "upper", label: "Al menos una letra mayúscula", test: (s: string) => /[A-Z]/.test(s) },
  { id: "num", label: "Al menos un número", test: (s: string) => /\d/.test(s) },
];

export function ChangePasswordModal({ open, onOpenChange }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const matches = next.length > 0 && next === confirm;
  const allValid = rules.every((r) => r.test(next)) && matches && current.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setCurrent(""); setNext(""); setConfirm(""); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-brand/15 text-brand">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center text-navy">Cambiar contraseña</DialogTitle>
          <DialogDescription className="text-center">
            Ingresá tu contraseña actual y luego la nueva contraseña dos veces.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (allValid) onOpenChange(false);
          }}
        >
          <Field label="Contraseña actual" value={current} onChange={setCurrent} show={show} setShow={setShow} />
          <Field label="Nueva contraseña" value={next} onChange={setNext} show={show} setShow={setShow} />
          <Field label="Repetir nueva contraseña" value={confirm} onChange={setConfirm} show={show} setShow={setShow} />

          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
              <AlertCircle className="h-3.5 w-3.5" /> Requisitos de seguridad
            </div>
            <ul className="space-y-1">
              {rules.map((r) => {
                const ok = r.test(next);
                return (
                  <li
                    key={r.id}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      ok ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <Check className={cn("h-3.5 w-3.5", ok ? "opacity-100" : "opacity-30")} />
                    {r.label}
                  </li>
                );
              })}
              <li
                className={cn(
                  "flex items-center gap-2 text-xs",
                  matches ? "text-success" : "text-muted-foreground",
                )}
              >
                <Check className={cn("h-3.5 w-3.5", matches ? "opacity-100" : "opacity-30")} />
                Las contraseñas nuevas coinciden
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!allValid} className="bg-navy text-navy-foreground hover:bg-navy/90">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  show: boolean;
  setShow: (b: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label={show ? "Ocultar" : "Mostrar"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
