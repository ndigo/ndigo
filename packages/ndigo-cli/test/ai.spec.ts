// @vitest-environment node
/**
 * Real-bin specs for `ndigo ai:init | ai:check | ai:update`.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');
const SKILLS = [
    'ndigo-app',
    'ndigo-debug',
    'ndigo-endpoint',
    'ndigo-persistence',
    'ndigo-reactive',
    'ndigo-ui',
    'ndigo-upgrade',
    'ndigo-verify',
    'ndigo-views',
];

const dirs: string[] = [];

afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

interface Result {
    readonly code: number;
    readonly out: string;
    readonly err: string;
}

function runCli(args: string[], cwd?: string): Promise<Result> {
    const proc = spawn(process.execPath, [BIN, ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    const out: string[] = [];
    const err: string[] = [];
    if (proc.stdout !== null) {
        void (async () => {
            for await (const chunk of proc.stdout) out.push(String(chunk));
        })().catch(() => undefined);
    }
    if (proc.stderr !== null) {
        void (async () => {
            for await (const chunk of proc.stderr) err.push(String(chunk));
        })().catch(() => undefined);
    }
    return new Promise<number>((resolveCode) => {
        proc.once('close', resolveCode);
    }).then((code) => ({ code, out: out.join(''), err: err.join('') }));
}

function createApp(): string {
    const dir = mkdtempSync(join(tmpdir(), 'ndigo-ai-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', private: true }));
    return dir;
}

function skillPath(dir: string, id = 'ndigo-app'): string {
    return join(dir, '.agents', 'skills', id, 'SKILL.md');
}

describe('ndigo ai', () => {
    it('merges the managed block into an existing AGENTS.md and writes nine skills', async () => {
        const dir = createApp();
        writeFileSync(join(dir, 'AGENTS.md'), 'Hand-written intro.\n');

        const result = await runCli(['ai', 'init', dir]);
        expect(result.code).toBe(0);

        const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
        expect(agents.startsWith('Hand-written intro.\n')).toBe(true);
        expect(agents).toContain('<!-- BEGIN:ndigo-agent-rules -->');
        expect(agents).toContain('<!-- END:ndigo-agent-rules -->');
        expect(agents).toContain('## Ndigo docs index');
        expect(existsSync(join(dir, '.mcp.json'))).toBe(false);
        for (const id of SKILLS) expect(existsSync(skillPath(dir, id))).toBe(true);
    });

    it('is idempotent', async () => {
        const dir = createApp();
        expect((await runCli(['ai', 'init', dir])).code).toBe(0);
        const first = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
        const before = readFileSync(skillPath(dir), 'utf8');

        const second = await runCli(['ai', 'init', dir]);
        expect(second.code).toBe(0);
        expect(second.out).toContain('unchanged AGENTS.md');
        expect(readFileSync(join(dir, 'AGENTS.md'), 'utf8')).toBe(first);
        expect(readFileSync(skillPath(dir), 'utf8')).toBe(before);
    });

    it('fails check after a manual edit and repairs with update --force', async () => {
        const dir = createApp();
        expect((await runCli(['ai', 'init', dir])).code).toBe(0);
        expect((await runCli(['ai', 'check', dir])).code).toBe(0);

        writeFileSync(skillPath(dir), `${readFileSync(skillPath(dir), 'utf8')}\nmanual edit\n`);
        const stale = await runCli(['ai', 'check', dir]);
        expect(stale.code).toBe(1);
        expect(stale.out).toContain('stale .agents/skills/ndigo-app/SKILL.md');

        expect((await runCli(['ai', 'update', dir, '--force'])).code).toBe(0);
        expect((await runCli(['ai', 'check', dir])).code).toBe(0);
    });

    it('refuses drifted generated files without --force', async () => {
        const dir = createApp();
        expect((await runCli(['ai', 'init', dir])).code).toBe(0);
        writeFileSync(skillPath(dir), 'manual\n');

        const drift = await runCli(['ai', 'init', dir]);
        expect(drift.code).toBe(2);
        expect(drift.err).toContain('--force');
    });

    it('merges the ndigo server into an existing .mcp.json', async () => {
        const dir = createApp();
        writeFileSync(
            join(dir, '.mcp.json'),
            `${JSON.stringify({ mcpServers: { other: { command: 'other' } } }, null, 2)}\n`
        );

        expect((await runCli(['ai', 'init', dir, '--mcp'])).code).toBe(0);
        const config = JSON.parse(readFileSync(join(dir, '.mcp.json'), 'utf8')) as {
            mcpServers: Record<string, { command: string; args?: string[] }>;
        };
        expect(config.mcpServers['other']?.command).toBe('other');
        expect(config.mcpServers['ndigo']).toEqual({ command: 'ndigo', args: ['mcp', '.'] });
    });

    it('writes skills only with --skills', async () => {
        const dir = createApp();
        writeFileSync(join(dir, 'AGENTS.md'), 'Hand-written intro.\n');

        const result = await runCli(['ai', 'init', dir, '--skills']);
        expect(result.code).toBe(0);
        expect(readFileSync(join(dir, 'AGENTS.md'), 'utf8')).toBe('Hand-written intro.\n');
        expect(existsSync(skillPath(dir))).toBe(true);
    });

    it('honours --instruction-file and --dry-run', async () => {
        const dir = createApp();

        const dry = await runCli(['ai', 'init', dir, '--instruction-file', 'CLAUDE.md', '--dry-run']);
        expect(dry.code).toBe(0);
        expect(dry.out).toContain('would write CLAUDE.md');
        expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(false);

        expect((await runCli(['ai', 'init', dir, '--instruction-file', 'CLAUDE.md'])).code).toBe(0);
        expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true);
        expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
    });

    it('rejects an unmatched managed marker', async () => {
        const dir = createApp();
        mkdirSync(join(dir), { recursive: true });
        writeFileSync(join(dir, 'AGENTS.md'), '<!-- BEGIN:ndigo-agent-rules -->\ntext\n');

        const result = await runCli(['ai', 'init', dir]);
        expect(result.code).toBe(2);
        expect(result.err).toContain('unmatched ndigo-agent-rules marker');
    });
});
