/**
 * `ndigo env` — validate required environment variables.
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { jsonFlag, writeJson } from './_json.js';
import { appDirPositional } from './_script-fronts.js';

/** One key from the env template and whether the environment supplies it. */
interface EnvEntry {
    readonly key: string;
    readonly present: boolean;
}

/**
 * The env-template validation command.
 */
export const envCommand = buildCommand({
    async func(flags: { file?: string; json?: boolean }, dir: string) {
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
        const entries: EnvEntry[] = keys.map((key) => ({
            key,
            present: process.env[key] !== undefined && process.env[key] !== '',
        }));
        const missing = entries.filter((entry) => !entry.present).map((entry) => entry.key);

        if (flags.json === true) {
            writeJson({ file, entries, missing, ok: missing.length === 0 });
        } else {
            for (const entry of entries) {
                process.stdout.write(`${entry.present ? 'OK     ' : 'MISSING'} ${entry.key}\n`);
            }
        }
        if (missing.length > 0) process.exitCode = 1;
    },
    parameters: {
        flags: {
            file: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Env template file (default: .env.example).',
                optional: true,
            },
            json: jsonFlag,
        },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Validate required environment variables against a template' },
});
