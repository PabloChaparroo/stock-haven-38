import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileModal } from "@/components/modals/profile-modal";
import { currentUser } from "@/lib/mock-data";

export function AppHeader() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-header-gradient sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border/60 px-6 backdrop-blur">
      <SidebarTrigger className="text-navy hover:bg-navy/10" />
      <div className="flex-1" />

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full text-navy hover:bg-navy/10">
          <Bell className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 rounded-full pl-1 pr-3 py-1 transition hover:bg-navy/5"
        >
          <Avatar className="h-10 w-10 ring-2 ring-brand/40">
            <AvatarImage src={currentUser.image} />
            <AvatarFallback>
              {currentUser.firstName[0]}
              {currentUser.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left text-sm leading-tight md:block">
            <div className="font-semibold text-navy">
              {currentUser.firstName} {currentUser.lastName}
            </div>
            <div className="text-muted-foreground">{currentUser.email}</div>
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-navy hover:bg-navy/10"
          onClick={() => setProfileOpen(true)}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
