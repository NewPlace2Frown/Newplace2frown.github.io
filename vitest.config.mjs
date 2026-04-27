import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run test files sequentially to avoid concurrent Eleventy builds
    // conflicting on Windows file locks (especially assets with spaces in names).
    fileParallelism: false,
  },
});
