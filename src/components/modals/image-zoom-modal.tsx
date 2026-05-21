import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string;
  alt?: string;
};

export function ImageZoomModal({ open, onOpenChange, src, alt }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-0 bg-transparent p-0 shadow-none">
        {src && (
          <img
            src={src}
            alt={alt ?? "Imagen"}
            className="mx-auto max-h-[80vh] rounded-2xl bg-card object-contain shadow-2xl"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
