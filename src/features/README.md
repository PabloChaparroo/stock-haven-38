# Feature-Based Architecture

Este directorio implementa la arquitectura modular del ERP Inventia. La idea es que cada **feature** (dominio de negocio) sea autocontenido y exponga su API pública mediante un `index.ts` (barrel).

## Estructura

```
src/
├── core/                    # Infra transversal a toda la app
│   ├── auth/                # AuthContext, store de sesión, roles/permisos
│   │   ├── auth-context.tsx
│   │   ├── auth-store.ts
│   │   ├── permissions.ts
│   │   └── index.ts
│   └── guards/              # Route guards para `beforeLoad` (TanStack Router)
│       └── route-guards.ts
│
├── features/                # Un directorio por dominio de negocio
│   ├── auth/                # Login, recuperación de password, perfil
│   ├── ventas/              # POS, historial, facturación AFIP
│   ├── inventario/          # Artículos, categorías, marcas, stock, precios
│   ├── compras/             # Órdenes, proveedores, facturación de compras
│   ├── gestion/             # Usuarios, accesos, almacén, movimientos
│   └── reportes/            # Métricas, ABC, predicciones
│
├── shared/                  # UI y utilidades genéricas reutilizables
│   ├── components/          # Botones, modales, tablas genéricas
│   ├── hooks/
│   └── utils/
│
└── routes/                  # File-based routing de TanStack Router
                             # (importa desde core/, features/ y shared/)
```

Cada feature internamente sigue:

```
features/ventas/
├── components/      # UI específica del módulo (no reutilizable fuera)
├── hooks/           # useCart, useFinalizeSale, ...
├── services/        # createServerFn / fetchers
├── pages/           # Componentes de página (montados desde src/routes/)
└── index.ts         # Barrel: exporta solo lo que otros módulos pueden consumir
```

## Convenciones

1. **Comunicación entre features**: solo vía el `index.ts` del feature destino. Nunca importar desde `features/x/components/Foo` directamente desde otro feature.
2. **Routing**: los archivos de `src/routes/` son thin wrappers que importan páginas desde `features/*/pages/` y aplican guards.
3. **UI compartida**: si un componente se usa en 2+ features, mover a `shared/components/`.
4. **Seguridad**: cualquier ruta protegida debe declarar su guard en `beforeLoad`. Ver más abajo.

## Routing centralizado vs file-based

TanStack Router usa **file-based routing** (`src/routes/*.tsx` → `routeTree.gen.ts` generado en build). Esto reemplaza al patrón `AppRoutes.tsx` de React Router DOM y aporta:

- Type-safety (`<Link to="/ventas">` valida en compile time).
- Code-splitting automático por ruta.
- SSR + preloading nativos.
- `beforeLoad` corre **antes** del render → no hay flash de contenido protegido.

Para "ver todas las rutas en un lugar", abrir `src/routeTree.gen.ts` (auto-generado) o el directorio `src/routes/`.

## Control de acceso (RBAC + PBAC)

### 1. Definir permisos
En `src/core/auth/permissions.ts` se centralizan `ROLES`, `PERMISSIONS` y el mapping `ROLE_PERMISSIONS`.

### 2. Proteger una ruta entera
Usar guards en `beforeLoad`:

```tsx
// src/routes/ventas.index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { requirePermissions, PERMISSIONS } from "@/core/auth";

export const Route = createFileRoute("/ventas/")({
  beforeLoad: requirePermissions([PERMISSIONS.VENTA_CREATE]),
  component: POSPage,
});
```

Variantes disponibles en `@/core/auth`:
- `requireAuth()` — solo exige sesión.
- `requireRoles([ROLES.ADMIN])` — exige uno de los roles.
- `requirePermissions([...], "all" | "any")` — exige permisos.
- `composeGuards(g1, g2, ...)` — combina varios.

Si el usuario no cumple, es redirigido a `/403` (o `/auth` si no hay sesión).

### 3. Proteger un fragmento de UI
Usar el wrapper `<PrivateRoute>` (no es una ruta, es un componente):

```tsx
import { PrivateRoute, PERMISSIONS } from "@/core/auth";

<PrivateRoute requiredPermissions={[PERMISSIONS.PRECIOS_UPDATE]}>
  <Button>Impactar nuevos precios</Button>
</PrivateRoute>
```

### 4. Cambiar de usuario (dev)
Ir a `/auth` para impersonar cualquiera de los roles del catálogo y probar los guards.
