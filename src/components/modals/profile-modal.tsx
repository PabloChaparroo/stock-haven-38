import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, KeyRound, LogOut, Mail, Phone, IdCard, User as UserIcon, Pencil, Check } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileModal({ open, onOpenChange }: Props) {
  const [photo, setPhoto] = useState(currentUser.image);
  const [editPhoto, setEditPhoto] = useState(false);
  const [pwd, setPwd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setPhoto(url);
      setEditPhoto(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <div className="bg-header-gradient px-6 pb-14 pt-8">
            <DialogHeader>
              <DialogTitle className="text-navy">Mi perfil</DialogTitle>
              <DialogDescription>Información personal de tu cuenta.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="-mt-12 flex flex-col items-center px-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-card shadow-lg">
                <AvatarImage src={photo} />
                <AvatarFallback className="bg-navy text-navy-foreground text-xl">
                  {currentUser.firstName[0]}
                  {currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => (editPhoto ? fileRef.current?.click() : setEditPhoto(true))}
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground shadow-md transition hover:scale-105"
                aria-label="Editar foto"
              >
                {editPhoto ? <Camera className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            </div>
            <h3 className="mt-3 text-lg font-bold text-navy">
              {currentUser.firstName} {currentUser.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{currentUser.roles.join(", ")}</p>
            {editPhoto && (
              <div className="mt-2 flex items-center gap-2 text-xs text-brand">
                <Check className="h-3 w-3" /> Solo podés modificar la foto de perfil
              </div>
            )}
          </div>

          <div className="grid gap-2 px-6 pb-2 pt-5">
            <InfoRow icon={UserIcon} label="Nombre" value={currentUser.firstName} />
            <InfoRow icon={UserIcon} label="Apellido" value={currentUser.lastName} />
            <InfoRow icon={IdCard} label="DNI" value={currentUser.dni} />
            <InfoRow icon={Mail} label="Email" value={currentUser.email} />
            <InfoRow icon={Phone} label="Teléfono" value={currentUser.phone} />
          </div>

          <div className="flex flex-col gap-2 border-t bg-muted/30 px-6 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-navy/20 text-navy hover:bg-navy/5"
              onClick={() => setPwd(true)}
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onOpenChange(false)}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordModal open={pwd} onOpenChange={setPwd} />
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-navy">{value}</div>
      </div>
    </div>
  );
}
