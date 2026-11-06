#!/usr/bin/env node
import { runCli } from '../lib/index.js';

// The `ndigo` executable (AD-75): Stricli resolves commands from the
// route map built in src/index.ts. Lives outside src/ so the shebang and
// the doc-header lint rule coexist.
await runCli();