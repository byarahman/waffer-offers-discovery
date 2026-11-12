import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites live at /<repository>/, user sites at /.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const username = process.env.GITHUB_REPOSITORY?.split('/')[0] ?? '';
const base = repository && repository.toLowerCase() !== `${username.toLowerCase()}.github.io`
  ? `/${repository}/` : '/';
export default defineConfig({plugins: [react()], base, build: {outDir: 'dist'}});
