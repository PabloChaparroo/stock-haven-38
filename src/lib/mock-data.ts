import logo from "@/assets/inventia-logo.png";

export const PLACEHOLDER_IMG = logo;

export type Category = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export type Brand = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export type Variant = {
  id: string;
  code: string;
  name: string;
  description: string;
};

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
  variants?: Variant[];
};

export const categories: Category[] = [
  { id: "1", code: "CAT-01", name: "Computadoras", description: "Notebooks, PCs de escritorio y workstations." },
  { id: "2", code: "CAT-02", name: "Periféricos", description: "Teclados, mouses, monitores y accesorios." },
  { id: "3", code: "CAT-03", name: "Almacenamiento", description: "Discos rígidos, SSDs y memorias USB." },
  { id: "4", code: "CAT-04", name: "Redes", description: "Routers, switches y placas de red." },
  { id: "5", code: "CAT-05", name: "Impresión", description: "Impresoras, tóner y consumibles." },
];

export const brands: Brand[] = [
  { id: "1", code: "MAR-01", name: "Lenovo", description: "Equipos corporativos y consumo." },
  { id: "2", code: "MAR-02", name: "HP", description: "Impresión, notebooks y servidores." },
  { id: "3", code: "MAR-03", name: "Dell", description: "Workstations y desktops empresariales." },
  { id: "4", code: "MAR-04", name: "Logitech", description: "Periféricos premium." },
  { id: "5", code: "MAR-05", name: "Samsung", description: "Almacenamiento y monitores." },
];

const lorem =
  "Computadora versátil pensada para entornos corporativos exigentes, con procesador de última generación, memoria expansible y autonomía prolongada para uso intensivo en oficina.";

export const articles: Article[] = Array.from({ length: 12 }).map((_, i) => ({
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
}));

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
