// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://iglesiacac.es',
  integrations: [
    tailwind(),
    sitemap({
      lastmod: new Date(),
      serialize(item) {
        // Prioridades personalizadas por página
        if (item.url === 'https://iglesiacac.es/') item.priority = 1.0;
        else if (item.url.includes('primera-vez')) item.priority = 0.9;
        else if (item.url.includes('predicaciones')) item.priority = 0.8;
        else if (item.url.includes('jovenes') || item.url.includes('contacto')) item.priority = 0.7;
        else if (item.url.includes('donar')) item.priority = 0.6;
        else if (item.url.includes('transparencia')) item.priority = 0.5;
        else if (item.url.includes('aviso-legal') || item.url.includes('politica')) item.priority = 0.2;
        return item;
      },
    }),
  ],
});
