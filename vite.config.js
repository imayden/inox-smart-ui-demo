import { defineConfig } from 'vite';

export default defineConfig({
  // 使用项目内独立缓存目录，避免本地预览时写入共享 node_modules 缓存。
  cacheDir: '.vite-cache',
  esbuild: {
    jsx: 'automatic',
  },
});
