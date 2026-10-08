#!/usr/bin/env node
import { execute } from '@oclif/core';

// The `blue` executable (AD-75): oclif discovers the command classes from
// the package's `oclif.commands` config (./lib/commands). Lives outside
// src/ so the shebang and the doc-header lint rule coexist — and this is
// oclif's own convention for the bin.
await execute({ dir: import.meta.url, args: process.argv.slice(2) });
