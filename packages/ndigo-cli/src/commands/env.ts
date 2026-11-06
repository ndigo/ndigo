/**
 * `ndigo env` — validate required environment variables.
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appDirPositional } from './_script-fronts.js';

/**
 * The env-template validation command.
 */
export const envCommand = buildCommand({
    async func(flags: { file?: string }, dir: string) {
        const file = flags.file ?? join(dir, '.env.example');
        if (!existsSync(file)) {
            process.stderr.write(`env file not found: ${file}\n`);
            process.exitCode = 2;
            return;
        }
        const keys = readFileSync(file, 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith('#'))
            .map((line) => line.split('=')[0]?.trim() ?? '')
            .filter((key) => key.length > 0);
        let missing = 0;
        for (const key of keys) {
            if (process.env[key] === undefined || process.env[key] === '') {
                process.stdout.write(`MISSING ${key}\n`);
                missing++;
            } else {
                process.stdout.write(`OK      ${key}\n`);
            }
        }
        if (missing > 0) process.exitCode = 1;
    },
    parameters: {
        flags: {
            file: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Env template file (default: .env.example).',
                optional: true,
            },
        },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Validate required environment variables against a template' },
});
