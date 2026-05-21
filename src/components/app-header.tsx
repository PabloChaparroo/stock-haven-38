import { Bell, LogOut, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="bg-header-gradient sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border/60 px-6 backdrop-blur">
      <SidebarTrigger className="text-navy hover:bg-navy/10" />

      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar"
          className="h-11 rounded-full border-border/70 bg-card pl-10 text-sm shadow-sm focus-visible:ring-brand"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full text-navy hover:bg-navy/10">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-brand/40">
            <AvatarImage src="https://i.pravatar.cc/80?img=47" />
            <AvatarFallback>OR</AvatarFallback>
          </Avatar>
          <div className="hidden text-sm leading-tight md:block">
            <div className="font-semibold text-navy">Olivia Rhye</div>
            <div className="text-muted-foreground">olivia@gmail.com</div>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full text-navy hover:bg-navy/10">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
