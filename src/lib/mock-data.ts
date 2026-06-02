import logo from "@/assets/inventia-logo.png";

export const PLACEHOLDER_IMG = logo;

export type Category = {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  active: boolean;
};

export type Brand = {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  active: boolean;
};

export type Variant = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export type VariantStock = { variantId: string; stock: number; safetyStock?: number };

export type Article = {
  id: string;
  code: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  abbreviation: string;
  image: string;
  createdAt: string;
  stock: number;
  safetyStock: number;
  category: string;
  supplier?: string;
  variants?: Variant[];
  variantStocks?: VariantStock[];
};

export type Role = {
  id: string;
  name: string;
  createdAt: string;
  permissions: string[]; // permission ids
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  image: string;
  createdAt: string;
  active: boolean;
  roles: string[]; // role names
  description?: string;
};

export const categories: Category[] = [
  { id: "1", code: "CAT-01", name: "Computadoras", description: "Notebooks, PCs de escritorio y workstations.", createdAt: "01/05/2026", active: true },
  { id: "2", code: "CAT-02", name: "Periféricos", description: "Teclados, mouses, monitores y accesorios.", createdAt: "03/05/2026", active: true },
  { id: "3", code: "CAT-03", name: "Almacenamiento", description: "Discos rígidos, SSDs y memorias USB.", createdAt: "10/05/2026", active: true },
  { id: "4", code: "CAT-04", name: "Redes", description: "Routers, switches y placas de red.", createdAt: "15/05/2026", active: false },
  { id: "5", code: "CAT-05", name: "Impresión", description: "Impresoras, tóner y consumibles.", createdAt: "20/05/2026", active: true },
];

export const brands: Brand[] = [
  { id: "1", code: "MAR-01", name: "Lenovo", description: "Equipos corporativos y consumo.", createdAt: "01/05/2026", active: true },
  { id: "2", code: "MAR-02", name: "HP", description: "Impresión, notebooks y servidores.", createdAt: "03/05/2026", active: true },
  { id: "3", code: "MAR-03", name: "Dell", description: "Workstations y desktops empresariales.", createdAt: "10/05/2026", active: true },
  { id: "4", code: "MAR-04", name: "Logitech", description: "Periféricos premium.", createdAt: "15/05/2026", active: false },
  { id: "5", code: "MAR-05", name: "Samsung", description: "Almacenamiento y monitores.", createdAt: "20/05/2026", active: true },
];

const lorem =
  "Computadora versátil pensada para entornos corporativos exigentes, con procesador de última generación, memoria expansible y autonomía prolongada para uso intensivo en oficina.";

export const articles: Article[] = Array.from({ length: 28 }).map((_, i) => ({
  id: String(i + 1),
  code: `12345${i}`,
  name: i % 3 === 0 ? "T10 G5" : i % 3 === 1 ? "EliteBook 840" : "Latitude 7420",
  brand: brands[i % brands.length].name,
  price: 700000 + i * 12500,
  description: lorem,
  abbreviation: "NB",
  image: PLACEHOLDER_IMG,
  createdAt: "12/07/2026 - 20:30",
  stock: i === 11 ? 5 : 100 - i,
  safetyStock: 12,
  category: categories[i % categories.length].name,
  variants:
    i % 4 === 0
      ? [
          { id: "v1", code: "VAR-01", name: "8GB / 256GB", description: "Configuración estándar" },
          { id: "v2", code: "VAR-02", name: "16GB / 512GB", description: "Configuración avanzada" },
        ]
      : [],
  variantStocks:
    i % 4 === 0
      ? [
          { variantId: "v1", stock: 10 + i, safetyStock: 5 },
          { variantId: "v2", stock: 4 + i, safetyStock: 8 },
        ]
      : [],
}));

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// ============== Roles & Permisos ==============

export type PermissionGroup = {
  group: string;
  permissions: { id: string; name: string; description: string }[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    group: "Inventario",
    permissions: [
      { id: "inv.view", name: "Ver artículos", description: "Consultar el listado de artículos" },
      { id: "inv.create", name: "Crear artículos", description: "Dar de alta nuevos artículos" },
      { id: "inv.edit", name: "Editar artículos", description: "Modificar artículos existentes" },
      { id: "inv.delete", name: "Eliminar artículos", description: "Dar de baja artículos" },
    ],
  },
  {
    group: "Ventas",
    permissions: [
      { id: "sales.view", name: "Ver ventas", description: "Consultar registros de ventas" },
      { id: "sales.create", name: "Crear ventas", description: "Registrar nuevas ventas" },
      { id: "sales.refund", name: "Anular ventas", description: "Realizar devoluciones" },
    ],
  },
  {
    group: "Compras",
    permissions: [
      { id: "buy.view", name: "Ver compras", description: "Consultar órdenes de compra" },
      { id: "buy.create", name: "Crear órdenes", description: "Generar órdenes de compra" },
    ],
  },
  {
    group: "Gestión",
    permissions: [
      { id: "users.manage", name: "Gestionar usuarios", description: "ABM de usuarios" },
      { id: "roles.manage", name: "Gestionar roles", description: "ABM de roles y permisos" },
      { id: "warehouse.manage", name: "Gestionar almacén", description: "Configurar depósitos" },
    ],
  },
  {
    group: "Reportes",
    permissions: [
      { id: "reports.view", name: "Ver reportes", description: "Acceder a métricas y reportes" },
      { id: "reports.export", name: "Exportar reportes", description: "Descargar reportes en CSV/PDF" },
    ],
  },
];

export const allPermissionIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));

export const roles: Role[] = [
  {
    id: "1",
    name: "Administrador",
    createdAt: "01/05/2026",
    permissions: allPermissionIds,
  },
  {
    id: "2",
    name: "Vendedor",
    createdAt: "03/05/2026",
    permissions: ["inv.view", "sales.view", "sales.create"],
  },
  {
    id: "3",
    name: "Encargado de stock",
    createdAt: "10/05/2026",
    permissions: ["inv.view", "inv.create", "inv.edit", "warehouse.manage"],
  },
  {
    id: "4",
    name: "Auditor",
    createdAt: "15/05/2026",
    permissions: ["inv.view", "sales.view", "buy.view", "reports.view", "reports.export"],
  },
];

const userImgs = [
  "https://i.pravatar.cc/120?img=47",
  "https://i.pravatar.cc/120?img=12",
  "https://i.pravatar.cc/120?img=32",
  "https://i.pravatar.cc/120?img=5",
  "https://i.pravatar.cc/120?img=68",
  "https://i.pravatar.cc/120?img=23",
];

export const users: User[] = [
  {
    id: "1",
    firstName: "Olivia",
    lastName: "Rhye",
    dni: "35.123.456",
    email: "olivia@inventia.com",
    phone: "+54 9 11 5555-0101",
    image: userImgs[0],
    createdAt: "12/07/2026",
    active: true,
    roles: ["Administrador"],
    description: "Fundadora y administradora general del sistema.",
  },
  {
    id: "2",
    firstName: "Mateo",
    lastName: "González",
    dni: "40.987.654",
    email: "mateo@inventia.com",
    phone: "+54 9 11 5555-0102",
    image: userImgs[1],
    createdAt: "14/07/2026",
    active: true,
    roles: ["Vendedor"],
    description: "Vendedor del local centro.",
  },
  {
    id: "3",
    firstName: "Lucía",
    lastName: "Fernández",
    dni: "38.456.123",
    email: "lucia@inventia.com",
    phone: "+54 9 11 5555-0103",
    image: userImgs[2],
    createdAt: "20/07/2026",
    active: false,
    roles: ["Encargado de stock"],
    description: "Encargada del depósito principal.",
  },
  {
    id: "4",
    firstName: "Tomás",
    lastName: "Pérez",
    dni: "42.111.222",
    email: "tomas@inventia.com",
    phone: "+54 9 11 5555-0104",
    image: userImgs[3],
    createdAt: "01/08/2026",
    active: true,
    roles: ["Vendedor", "Auditor"],
    description: "Doble función comercial y auditoría.",
  },
  {
    id: "5",
    firstName: "Camila",
    lastName: "Suárez",
    dni: "39.333.444",
    email: "camila@inventia.com",
    phone: "+54 9 11 5555-0105",
    image: userImgs[4],
    createdAt: "05/08/2026",
    active: true,
    roles: ["Auditor"],
    description: "Auditora de movimientos y stock.",
  },
  {
    id: "6",
    firstName: "Bruno",
    lastName: "Martínez",
    dni: "41.555.666",
    email: "bruno@inventia.com",
    phone: "+54 9 11 5555-0106",
    image: userImgs[5],
    createdAt: "10/08/2026",
    active: false,
    roles: ["Vendedor"],
    description: "Vendedor sucursal norte.",
  },
];

export const currentUser: User = users[0];

// ============== Descuentos ==============

export type DiscountType = "category" | "combo";

export type ComboItem = {
  articleId: string;
  minQuantity: number;
};

export type Discount = {
  id: string;
  name: string;
  description: string;
  percentage: number;
  fromDate: string;
  toDate?: string;
  active: boolean;
  type: DiscountType;
  categoryName?: string;
  comboItems?: ComboItem[];
  createdAt: string;
};

export const discounts: Discount[] = [
  {
    id: "d1",
    name: "Promo Verano",
    description: "Descuento por temporada en periféricos.",
    percentage: 15,
    fromDate: "01/12/2026",
    toDate: undefined,
    active: true,
    type: "category",
    categoryName: "Periféricos",
    createdAt: "10/11/2026",
  },
  {
    id: "d2",
    name: "Black Friday Hardware",
    description: "Mega descuento de Black Friday en computadoras.",
    percentage: 25,
    fromDate: "20/11/2026",
    toDate: "30/11/2026",
    active: true,
    type: "category",
    categoryName: "Computadoras",
    createdAt: "01/10/2026",
  },
  {
    id: "d3",
    name: "Combo Oficina Pro",
    description: "Llevando 2 notebooks + 1 impresora.",
    percentage: 10,
    fromDate: "01/06/2026",
    toDate: "31/12/2026",
    active: true,
    type: "combo",
    comboItems: [
      { articleId: "1", minQuantity: 2 },
      { articleId: "5", minQuantity: 1 },
    ],
    createdAt: "15/05/2026",
  },
  {
    id: "d4",
    name: "Combo Gamer",
    description: "Periférico + monitor.",
    percentage: 12,
    fromDate: "01/07/2026",
    toDate: "31/12/2026",
    active: true,
    type: "combo",
    comboItems: [{ articleId: "3", minQuantity: 1 }],
    createdAt: "20/06/2026",
  },
  {
    id: "d5",
    name: "Liquidación Redes",
    description: "Stock de routers en oferta.",
    percentage: 30,
    fromDate: "01/03/2026",
    toDate: "30/04/2026",
    active: false,
    type: "category",
    categoryName: "Redes",
    createdAt: "20/02/2026",
  },
];

// ============== Proveedores ==============

export type IvaCondition = "Responsable Inscripto" | "Monotributo" | "Exento" | "Consumidor Final";

export type Supplier = {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string;
  socialRelation: string;
  address: string;
  email: string;
  cuit: string;
  createdAt: string;
  ivaCondition: IvaCondition;
  acceptsCheck: boolean;
  acceptsCredit: boolean;
  paymentDays: number;
  rating: number; // 1-5
  articleIds: string[];
};

export const ivaConditions: IvaCondition[] = [
  "Responsable Inscripto",
  "Monotributo",
  "Exento",
  "Consumidor Final",
];

const supplierNames = [
  "TecnoMayorista S.A.",
  "Distribuidora Andina",
  "ImporHardware SRL",
  "Periféricos del Sur",
  "ByteImport",
  "RedesPro Argentina",
  "OfficeStock SA",
  "MegaInsumos",
  "PrintZone SRL",
  "DigitalWare",
  "NovaTech",
  "GlobalChip",
  "Servicios Norte",
  "Compumundo Mayorista",
];

export const suppliers: Supplier[] = supplierNames.map((name, i) => ({
  id: String(i + 1),
  code: `PROV-${String(i + 1).padStart(3, "0")}`,
  name,
  description: i % 2 === 0 ? "Distribuidor oficial de tecnología corporativa." : "Importación directa de hardware.",
  phone: `+54 11 4${100 + i}-${1000 + i * 7}`,
  socialRelation: i % 3 === 0 ? "Cuenta clave" : i % 3 === 1 ? "Frecuente" : "Ocasional",
  address: `Av. Siempre Viva ${1000 + i * 17}, CABA`,
  email: `ventas@${name.toLowerCase().replace(/[^a-z]/g, "")}.com.ar`,
  cuit: `30-${String(12345678 + i).slice(0, 8)}-${i % 10}`,
  createdAt: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/2026`,
  ivaCondition: ivaConditions[i % ivaConditions.length],
  acceptsCheck: i % 2 === 0,
  acceptsCredit: i % 3 !== 0,
  paymentDays: [30, 60, 90, 15][i % 4],
  rating: (i % 5) + 1,
  articleIds: [],
}));

// ============== Clientes ==============

export type Client = {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  active: boolean;
};

const cliFirst = ["Olivia", "Mateo", "Lucía", "Tomás", "Camila", "Bruno", "Sofía", "Lucas", "Valentina", "Joaquín", "Martina", "Diego", "Renata", "Nicolás", "Julieta"];
const cliLast = ["Rhye", "González", "Fernández", "Pérez", "Suárez", "Martínez", "Romero", "López", "Díaz", "Sosa", "Ruiz", "Acosta", "Molina", "Castro", "Vega"];

export const clients: Client[] = Array.from({ length: 14 }).map((_, i) => ({
  id: String(i + 1),
  number: `CLI-${1000 + i + 42}`,
  firstName: cliFirst[i % cliFirst.length],
  lastName: cliLast[i % cliLast.length],
  dni: `${30 + i}.${String(100 + i * 7).padStart(3, "0")}.${String(456 + i).padStart(3, "0")}`,
  phone: `+54 9 11 5555-${String(2000 + i).slice(-4)}`,
  email: `${cliFirst[i % cliFirst.length].toLowerCase()}.${cliLast[i % cliLast.length].toLowerCase()}@mail.com`,
  address: `Calle ${100 + i * 3}, Piso ${1 + (i % 9)}, CABA`,
  createdAt: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/2026`,
  active: i % 5 !== 0,
}));
