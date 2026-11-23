/**
 * `ndigo verify` check runner: the declared catalog checks plus `doctor`,
 * with `--full` adding the app's typecheck, test, and lint lanes — each
 * executed against one application.
 */
import { performance } from 'node:perf_hooks';
import { readAppManifest, captureAppOnce } from '../helpers/app-scripts.js';
import type { CapturedRun } from '../helpers/app-scripts.js';
import { collectDiagnostics } from '../commands/_diagnostics.js';
import { probeMcpTools } from './_mcp-probe.js';
import { openApiProblems } from './_openapi-parity.js';
import type { CapabilityEntry } from './catalog.js';
import type { VerifyCheckResult, VerifyOptions, VerifyReport, VerifyStatus } from './report.js';

/** The execution order of known checks. */
const CHECK_ORDER = ['doctor', 'app-boot', 'mcp-stdio', 'route-parity', 'typecheck', 'test', 'lint'] as const;

/** The app lanes `--full` adds, on top of the declared checks and `doctor`. */
const FULL_CHECKS = ['typecheck', 'test', 'lint'] as const;

/** How much captured output a failure message quotes. */
const OUTPUT_TAIL_LINES = 5;

/** The hint shown when the app has no `inspect` script. */
const INSPECT_HINT = 'add an "inspect" script that prints the manifest';

/** Per-run state: memoized app boots so no check spawns the same process twice. */
interface RunContext {
    /** The verify options the checks read (`dir`, `capability`, `full`). */
    readonly options: VerifyOptions;
    /** The app manifest, read once even though `hasScript` consults it per check. */
    manifestOnce: () => Record<string, unknown> | null;
    /** One `tools/list` probe per run, shared by the mcp-stdio and route-parity checks. */
    probeOnce: () => Promise<string[]>;
    /** One captured `inspect` boot, shared by the app-boot and route-parity checks. */
    inspectOnce: () => Promise<CapturedRun>;
}

/**
 * Creates the per-run context. A failed probe or inspect boot is memoized
 * too, so every check that needs it reports the same deterministic failure
 * instead of re-booting the app.
 */
function createRunContext(options: VerifyOptions): RunContext {
    let manifest: Record<string, unknown> | null | undefined;
    let probe: Promise<string[]> | undefined;
    let inspect: Promise<CapturedRun> | undefined;
    return {
        options,
        manifestOnce: () => {
            if (manifest === undefined) manifest = readAppManifest(options.dir);
            return manifest;
        },
        probeOnce: () => (probe ??= probeMcpTools(options.dir)),
        inspectOnce: () => (inspect ??= captureAppOnce(options.dir, 'inspect', INSPECT_HINT)),
    };
}

/**
 * Derives the check list: doctor first, then the named capability's declared
 * checks (or the catalog union), with `--full` adding test and lint.
 *
 * @param capability - The named capability, when one was given.
 * @param catalog - Every catalog capability.
 * @param full - Whether to add the full lanes.
 * @returns Check references in a stable order.
 */
export function selectChecks(
    capability: CapabilityEntry | undefined,
    catalog: readonly CapabilityEntry[],
    full: boolean
): string[] {
    const declared = capability === undefined ? catalog.flatMap((entry) => entry.checks) : [...capability.checks];
    const selected = new Set<string>(['doctor', ...declared]);
    if (full) for (const check of FULL_CHECKS) selected.add(check);
    const known = CHECK_ORDER.filter((id) => selected.has(id));
    const extra = [...selected].filter((id) => !CHECK_ORDER.includes(id as (typeof CHECK_ORDER)[number]));
    return [...known, ...extra];
}

/**
 * Runs every selected check sequentially.
 *
 * @param options - Application, capability, catalog, and full-lane choice.
 * @returns The report; `ok` is false when any check failed.
 */
export async function runVerification(options: VerifyOptions): Promise<VerifyReport> {
    const checks: VerifyCheckResult[] = [];
    const context = createRunContext(options);
    for (const check of selectChecks(options.capability, options.catalog, options.full === true)) {
        // Sequential by design: each check may spawn an app process, and stable
        // ordering keeps the report diffable.
        // oxlint-disable-next-line no-await-in-loop -- bounded process spawning, stable order
        checks.push(await runCheck(check, context));
    }
    const summary = {
        pass: checks.filter((check) => check.status === 'pass').length,
        fail: checks.filter((check) => check.status === 'fail').length,
        skip: checks.filter((check) => check.status === 'skip').length,
    };
    return {
        ok: summary.fail === 0,
        app: options.dir,
        ...(options.capability === undefined ? {} : { capability: options.capability.id }),
        checks,
        summary,
    };
}

async function runCheck(reference: string, context: RunContext): Promise<VerifyCheckResult> {
    const separator = reference.indexOf(':');
    const id = separator === -1 ? reference : reference.slice(0, separator);
    const target = separator === -1 ? undefined : reference.slice(separator + 1);
    const started = performance.now();
    // Every selected check gets a row: a check that throws (a malformed
    // declared script, a failed spawn) fails its row instead of aborting the
    // report and discarding the checks around it.
    const result = await execute(id, target, context).catch((error: unknown): CheckOutcome => ({
        status: 'fail',
        message: error instanceof Error ? error.message : String(error),
    }));
    return { id: reference, ...result, durationMs: Math.round(performance.now() - started) };
}

interface CheckOutcome {
    readonly status: VerifyStatus;
    readonly message?: string;
}

async function execute(id: string, target: string | undefined, context: RunContext): Promise<CheckOutcome> {
    switch (id) {
        case 'doctor':
            return runDoctor(context.options.dir);
        case 'app-boot':
            return runAppBoot(context);
        case 'mcp-stdio':
            return runMcpCheck(target, context);
        case 'route-parity':
            return runParityCheck(target, context);
        case 'typecheck':
        case 'test':
        case 'lint':
            return runScriptCheck(id, context);
        default:
            return {
                status: 'fail',
                message: `unknown check '${id}' — known checks: ${CHECK_ORDER.join(', ')}`,
            };
    }
}

async function runDoctor(dir: string): Promise<CheckOutcome> {
    const report = await collectDiagnostics(dir, { requireWorkspace: false });
    if (report.failures.length === 0) return { status: 'pass', message: 'environment ok' };
    return {
        status: 'fail',
        message: report.failures.slice(0, 3).join('; '),
    };
}

async function runAppBoot(context: RunContext): Promise<CheckOutcome> {
    const strict = context.options.capability !== undefined;
    if (!hasScript(context, 'inspect')) return missingScript('inspect', strict);
    const run = await context.inspectOnce();
    if (run.exitCode !== 0) {
        return { status: 'fail', message: `"inspect" exited ${run.exitCode}${outputTail(run)}` };
    }
    try {
        const manifest = JSON.parse(run.stdout) as { version?: unknown; app?: unknown; routes?: unknown };
        // `typeof null === 'object'`, so a null manifest must be rejected
        // explicitly.
        if (
            manifest.version !== 1 ||
            typeof manifest.app !== 'object' ||
            manifest.app === null ||
            !Array.isArray(manifest.routes)
        ) {
            return { status: 'fail', message: 'the inspect script did not print a v1 application manifest' };
        }
        return { status: 'pass', message: `manifest v1, ${manifest.routes.length} routes` };
    } catch {
        return { status: 'fail', message: `the inspect script printed invalid JSON${outputTail(run)}` };
    }
}

async function runMcpCheck(target: string | undefined, context: RunContext): Promise<CheckOutcome> {
    if (target !== undefined && target !== 'tools/list') {
        return { status: 'fail', message: `unsupported mcp-stdio target '${target}' — only tools/list is defined` };
    }
    if (!hasScript(context, 'mcp')) return missingScript('mcp', context.options.capability !== undefined);
    try {
        const tools = await context.probeOnce();
        return { status: 'pass', message: `${tools.length} tools` };
    } catch (error) {
        return { status: 'fail', message: error instanceof Error ? error.message : String(error) };
    }
}

async function runParityCheck(target: string | undefined, context: RunContext): Promise<CheckOutcome> {
    if (target !== undefined && target !== '*') {
        return { status: 'fail', message: `unsupported route-parity target '${target}' — only * is defined` };
    }
    const strict = context.options.capability !== undefined;
    if (!hasScript(context, 'inspect')) return missingScript('inspect', strict);
    if (!hasScript(context, 'mcp')) return missingScript('mcp', strict);

    const manifest = await inspectManifest(context);
    if (manifest === null) return { status: 'fail', message: 'the inspect script did not print a JSON manifest' };
    let tools: string[];
    try {
        tools = await context.probeOnce();
    } catch (error) {
        return { status: 'fail', message: error instanceof Error ? error.message : String(error) };
    }

    const mapped = new Map<string, { pattern: string; methods: readonly string[] }>();
    for (const row of manifest.mappings) {
        if (typeof row.tool === 'string') {
            mapped.set(row.tool, {
                pattern: row.pattern,
                methods: (row.httpMethods ?? []).map((method) => method.toLowerCase()),
            });
        }
    }
    const problems: string[] = [];
    for (const tool of mapped.keys()) {
        if (!tools.includes(tool)) problems.push(`tool '${tool}' is missing from tools/list`);
    }
    for (const tool of tools) {
        if (!mapped.has(tool)) problems.push(`tool '${tool}' has no @toolMapping in the manifest`);
    }

    let note = '';
    if (hasScript(context, 'openapi')) {
        const run = await captureAppOnce(
            context.options.dir,
            'openapi',
            'add an "openapi" script that prints the spec'
        );
        if (run.exitCode !== 0) {
            problems.push(`"openapi" exited ${run.exitCode}${outputTail(run)}`);
        } else {
            problems.push(...openApiProblems(run.stdout, mapped));
        }
    } else {
        note = ' — no "openapi" script; tool ↔ mapping parity only';
    }
    if (problems.length > 0) return { status: 'fail', message: problems.join('; ') };
    return { status: 'pass', message: `${mapped.size} tools match the manifest and OpenAPI${note}` };
}

async function runScriptCheck(id: 'typecheck' | 'test' | 'lint', context: RunContext): Promise<CheckOutcome> {
    if (!hasScript(context, id)) return { status: 'skip', message: `no "${id}" script` };
    const run = await captureAppOnce(context.options.dir, id, `add a "${id}" script`);
    if (run.exitCode !== 0) return { status: 'fail', message: `"${id}" exited ${run.exitCode}${outputTail(run)}` };
    return { status: 'pass' };
}

interface InspectSubset {
    readonly mappings: readonly {
        readonly pattern: string;
        readonly httpMethods?: readonly string[];
        readonly tool?: string;
    }[];
}

async function inspectManifest(context: RunContext): Promise<InspectSubset | null> {
    const run = await context.inspectOnce();
    if (run.exitCode !== 0) return null;
    try {
        const parsed = JSON.parse(run.stdout) as { mappings?: unknown };
        return Array.isArray(parsed.mappings) ? { mappings: parsed.mappings as InspectSubset['mappings'] } : null;
    } catch {
        return null;
    }
}

function hasScript(context: RunContext, key: string): boolean {
    const scripts = context.manifestOnce()?.['scripts'];
    if (typeof scripts !== 'object' || scripts === null) return false;
    return typeof (scripts as Record<string, unknown>)[key] === 'string';
}

function missingScript(key: string, strict: boolean): CheckOutcome {
    return strict
        ? { status: 'fail', message: `no "${key}" script — the named capability declares this check` }
        : { status: 'skip', message: `no "${key}" script` };
}

function outputTail(run: { readonly stdout: string; readonly stderr: string }): string {
    const text = `${run.stderr}\n${run.stdout}`.trim();
    if (text === '') return '';
    return `:\n${text.split('\n').slice(-OUTPUT_TAIL_LINES).join('\n')}`;
}
