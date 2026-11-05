#!/usr/bin/env node
/**
 * Point Git at the repository's tracked hooks (see AGENTS.md §8).
 *
 * `core.hooksPath` is local clone configuration, so this runs once per clone
 * and is shared by every worktree of that clone.
 */

import { chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const hook = new URL('../.githooks/pre-commit', import.meta.url);
const { status, error } = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });

if (error || status !== 0) {
    console.error('hooks:install: could not set core.hooksPath');
    process.exit(status ?? 1);
}

// A clone with core.fileMode=false can check the hook out without its
// executable bit; restore it so Git will run the hook.
chmodSync(hook, 0o755);

console.log('hooks:install: core.hooksPath -> .githooks');
