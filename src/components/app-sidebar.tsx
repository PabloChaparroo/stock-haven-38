import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ProfileModal } from "@/components/modals/profile-modal";
import {
  Home,
  Package,
  Boxes,
  LayoutGrid,
  Tags,
  Percent,
  DollarSign,
  Receipt,
  Users,
  Wallet,
  ShoppingCart,
  ClipboardList,
  Truck,
  Warehouse,
  UserCog,
  ShieldCheck,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import logo from "@/assets/inventia-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type Group = { title: string; icon: React.ComponentType<{ className?: string }>; items: Item[] };

const groups: Group[] = [
  {
    title: "Inventario",
    icon: Package,
    items: [
      { title: "Artículos", url: "/inventario/articulos", icon: Boxes },
      { title: "Ajuste de Stock", url: "/inventario/ajuste-stock", icon: Activity },
      { title: "Salida de Stock", url: "/inventario/salida-stock", icon: TrendingUp },
      { title: "Actualización de precios", url: "/inventario/precios", icon: DollarSign },
      { title: "Categoría", url: "/inventario/categorias", icon: LayoutGrid },
      { title: "Marcas", url: "/inventario/marcas", icon: Tags },
      { title: "Descuento", url: "/inventario/descuentos", icon: Percent },
    ],
  },
  {
    title: "Ventas",
    icon: DollarSign,
    items: [
      { title: "Punto de Venta", url: "/ventas", icon: DollarSign },
      { title: "Historial de Ventas", url: "/ventas/historial", icon: ClipboardList },
      { title: "Facturación", url: "/ventas/facturacion", icon: Receipt },
      { title: "Clientes", url: "/ventas/clientes", icon: Users },
      { title: "Caja", url: "/ventas/caja", icon: Wallet },
    ],
  },
  {
    title: "Compras",
    icon: ShoppingCart,
    items: [
      { title: "Orden de compra", url: "/compras/ordenes", icon: ClipboardList },
      { title: "Facturación", url: "/compras/facturacion", icon: Receipt },
      { title: "Proveedores", url: "/compras/proveedores", icon: Truck },
    ],
  },
  {
    title: "Gestión",
    icon: ShieldCheck,
    items: [
      { title: "Almacén", url: "/gestion/almacen", icon: Warehouse },
      { title: "Usuarios", url: "/gestion/usuarios", icon: UserCog },
      { title: "Accesos", url: "/gestion/accesos", icon: ShieldCheck },
      { title: "Movimientos", url: "/gestion/movimientos", icon: Activity },
    ],
  },
  {
    title: "Reportes",
    icon: BarChart3,
    items: [
      { title: "Métricas", url: "/reportes/metricas", icon: BarChart3 },
      { title: "ABC", url: "/reportes/abc", icon: PieChart },
      { title: "Predicciones", url: "/reportes/predicciones", icon: TrendingUp },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Abrir perfil"
          className="flex w-full items-center gap-2 rounded-md px-1 py-2 text-left transition hover:bg-sidebar-accent/50"
        >
          <img src={logo} alt="Inventia" className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <span className="text-2xl font-bold tracking-tight text-navy">
              INVENT<span className="text-brand">IA</span>
            </span>
          )}
        </button>
        <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip="Inicio"
                  className="h-10"
                >
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Inicio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {groups.map((group) => {
          const hasActive = group.items.some((i) => pathname.startsWith(i.url));
          return (
            <Collapsible key={group.title} defaultOpen={hasActive} className="group/coll">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={group.title}
                          className={cn(
                            "h-10 bg-brand/15 font-semibold text-navy hover:bg-brand/25",
                          )}
                        >
                          <group.icon className="h-5 w-5 text-brand" />
                          <span>{group.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=closed]/coll:-rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 border-l-2 border-navy/30 pl-0">
                        {group.items.map((item) => {
                          const active = pathname === item.url || pathname.startsWith(item.url + "/");
                          return (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={active}
                                className={cn(
                                  "h-9 gap-2 text-sidebar-foreground",
                                  active &&
                                    "bg-brand/15 text-navy font-medium",
                                )}
                              >
                                <Link to={item.url}>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
