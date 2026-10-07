import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// Extends the workspace base so `@blue/*` imports resolve to `src/` (not the
// built `lib/`) during tests, matching the other packages' configs. The
// previous standalone `{ test: { globals: true } }` block silently dropped
// that resolution (TOL-F6).
export default mergeConfig(baseConfig, defineConfig({}));
