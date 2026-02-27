# mi-web — Proyecto Astro

## Stack
- **Framework**: Astro 5 (template minimal)
- **Lenguaje**: TypeScript (strict mode off por defecto)
- **Estilos**: Sin framework de CSS — agregar con `astro add tailwind` si se necesita

## Comandos principales
```bash
npm run dev       # Servidor de desarrollo en http://localhost:4321
npm run build     # Build de producción → dist/
npm run preview   # Preview del build local
```

## Estructura del proyecto
```
mi-web/
├── public/           # Archivos estáticos (favicon, imágenes)
├── src/
│   └── pages/        # Cada .astro aquí es una ruta
│       └── index.astro
├── astro.config.mjs  # Configuración de Astro
└── package.json
```

## Convenciones
- Las páginas van en `src/pages/` — el nombre del archivo es la ruta URL
- Los componentes reutilizables van en `src/components/`
- Los layouts van en `src/layouts/`
- Los assets (imágenes, fuentes) van en `src/assets/` o `public/`

## Para agregar integraciones
```bash
npx astro add tailwind     # Tailwind CSS
npx astro add react        # React
npx astro add vue          # Vue
npx astro add sitemap      # Sitemap automático
```
