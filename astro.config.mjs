import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://rj-1234.github.io',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three'],
      exclude: [
        'vanta/dist/vanta.birds.min',
        'vanta/dist/vanta.net.min',
        'vanta/dist/vanta.clouds.min',
        'vanta/dist/vanta.dots.min',
        'vanta/dist/vanta.waves.min',
        'vanta/dist/vanta.cells.min',
      ],
    },
  },
});
