import { defineConfig } from 'vite';

export default defineConfig({
  // Use a project-local cache so local preview/builds do not depend on shared machine cache state.
  // 使用项目内独立缓存目录，避免本地预览/构建依赖共享机器缓存状态。
  cacheDir: '.vite-cache',
  esbuild: {
    jsx: 'automatic',
  },
});
