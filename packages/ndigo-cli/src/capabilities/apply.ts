/**
 * Capability plan/apply: resolve a catalog entry against an application,
 * classify every declared operation, and execute only the pending ones.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readAppManifest, usageError } from '../helpers/app-scripts.js';
import { addPackages } from '../helpers/package-manager.js';
import { CAPABILITIES_DIR } from './catalog.js';
import type { CapabilityEntry } from './catalog.js';
import { isSafeRelativePath } from './validate.js';

/** Whether the caller is planning or applying. */
export type CapabilityMode = 'plan' | 'apply';

/** Classification of one planned step. */
export type CapabilityStepStatus = 'pending' | 'satisfied' | 'conflict';

/** One declared operation, classified against the application. */
export interface CapabilityPlanStep {
    /** The catalog operation kind. */
    readonly op: 'addDependency' | 'writeFile' | 'editJson';
    /** What the step targets: a package, a file, or `file#/pointer`. */
    readonly target: string;
    /** Whether applying would change anything. */
    readonly status: CapabilityStepStatus;
}

/** One file the plan would write. */
export interface CapabilityWrite {
    /** Application-relative target path. */
    readonly path: string;
    /** Whether the file is absent or exists with different content. */
    readonly action: 'create' | 'update';
}

/** One JSON edit the plan would apply. */
export interface CapabilityEdit {
    /** Application-relative JSON file. */
    readonly path: string;
    /** RFC 6901 pointer. */
    readonly pointer: string;
    /** Value to set. */
    readonly value: unknown;
}

/** The machine-readable plan document. */
export interface CapabilityPlan {
    /** Capability id. */
    readonly capability: string;
    /** Requested mode. */
    readonly mode: CapabilityMode;
    /** Every declared step, in catalog order. */
    readonly steps: readonly CapabilityPlanStep[];
    /** Human-readable reasons the plan cannot be applied without `--force` or more variables. */
    readonly conflicts: readonly string[];
    /** Files the plan would write (pending steps only). */
    readonly writes: readonly CapabilityWrite[];
    /** Packages the plan would install (missing steps only). */
    readonly dependencies: readonly string[];
    /** Resolved template variables. */
    readonly variables: Readonly<Record<string, string>>;
}

/** A plan plus the concrete payloads apply needs. */
export interface CapabilityExecution {
    /** The JSON plan. */
    readonly plan: CapabilityPlan;
    /** Rendered file contents, keyed by application-relative path. */
    readonly files: ReadonlyMap<string, string>;
    /** Pending JSON edits. */
    readonly edits: readonly CapabilityEdit[];
}

/** Result of applying a plan. */
export interface CapabilityApplyResult {
    /** Files written. */
    readonly written: readonly string[];
    /** JSON files edited. */
    readonly edited: readonly string[];
    /** Packages installed. */
    readonly installed: readonly string[];
    /** Packages skipped because `--skipInstall` was passed. */
    readonly skipped: readonly string[];
}

/** Options for {@link planCapability}. */
export interface PlanCapabilityOptions {
    /** Application directory. */
    readonly dir: string;
    /** Requested mode, recorded in the plan. */
    readonly mode: CapabilityMode;
    /** Resolved template variables. */
    readonly variables: Readonly<Record<string, string>>;
    /** Treat differing files and JSON values as pending updates. */
    readonly force?: boolean;
}

/** Options for {@link applyCapability}. */
export interface ApplyCapabilityOptions {
    /** Application directory. */
    readonly dir: string;
    /** Report missing dependencies without installing them. */
    readonly skipInstall?: boolean;
    /**
     * Where the package manager's output goes (default `inherit`). JSON output
     * must pass `stderr` because stdout carries the document.
     */
    readonly dependencyStdio?: 'inherit' | 'stderr';
}

/**
 * Resolves a capability id, or an `@ndigo/*` package name, to one entry.
 *
 * @param target - Capability id or package name.
 * @param capabilities - The validated catalog entries.
 * @returns The matching capability.
 */
export function resolveCapability(target: string, capabilities: readonly CapabilityEntry[]): CapabilityEntry {
    if (target.startsWith('@ndigo/')) {
        const matches = capabilities.filter((capability) => capability.packages.includes(target));
        const match = matches[0];
        if (matches.length === 1 && match !== undefined) return match;
        if (matches.length > 1) {
            throw usageError(
                `${target} is composed by several capabilities (${matches.map((entry) => entry.id).join(', ')}) — pass the capability id`
            );
        }
        throw usageError(`no capability installs ${target} yet; add the package with \`pnpm add ${target}\``);
    }
    const capability = capabilities.find((entry) => entry.id === target);
    if (capability === undefined) {
        const ids = capabilities.map((entry) => entry.id).join(', ');
        throw usageError(`unknown capability '${target}' — known capabilities: ${ids}`);
    }
    return capability;
}

/**
 * Derives the built-in `appName` variable from the application manifest.
 *
 * @param manifest - The parsed application `package.json`.
 * @returns The scoped name stripped to its local part, or undefined.
 */
export function appNameOf(manifest: Readonly<Record<string, unknown>> | null): string | undefined {
    const name = manifest?.['name'];
    if (typeof name !== 'string' || name === '') return undefined;
    const slash = name.lastIndexOf('/');
    return slash === -1 ? name : name.slice(slash + 1);
}

/**
 * Resolves template variables from defaults, the built-in `appName`, and
 * `--var key=value` assignments.
 *
 * @param capability - The capability whose templates will be rendered.
 * @param assignments - Raw `key=value` inputs.
 * @param appName - Derived application name, when the manifest has one.
 * @returns The resolved values.
 */
export function resolveCapabilityVariables(
    capability: CapabilityEntry,
    assignments: readonly string[] | undefined,
    appName: string | undefined
): Record<string, string> {
    const declared = new Map((capability.variables ?? []).map((variable) => [variable.name, variable]));
    const resolved: Record<string, string> = {};
    for (const [name, variable] of declared) {
        if (variable.default !== undefined) resolved[name] = variable.default;
    }
    if (appName !== undefined) resolved['appName'] = appName;

    for (const assignment of assignments ?? []) {
        const separator = assignment.indexOf('=');
        if (separator <= 0) {
            throw usageError(`invalid --var '${assignment}' — expected name=value`);
        }
        const name = assignment.slice(0, separator);
        const value = assignment.slice(separator + 1);
        if (value === '') throw usageError(`--var ${name} needs a value`);
        if (name !== 'appName' && !declared.has(name)) {
            const known = [...declared.keys(), 'appName'].join(', ');
            throw usageError(`unknown variable '${name}' — declared variables: ${known}`);
        }
        resolved[name] = value;
    }
    return resolved;
}

/**
 * Classifies every operation in a capability against the application.
 *
 * @param capability - The catalog entry.
 * @param options - Application directory, mode, variables, and force.
 * @returns The plan plus the rendered payloads apply needs.
 */
export function planCapability(capability: CapabilityEntry, options: PlanCapabilityOptions): CapabilityExecution {
    const manifest = readAppManifest(options.dir);
    if (manifest === null) throw usageError(`'${options.dir}' is not an application directory — no package.json`);

    const declared = new Set([
        ...Object.keys((manifest['dependencies'] as Record<string, string> | undefined) ?? {}),
        ...Object.keys((manifest['devDependencies'] as Record<string, string> | undefined) ?? {}),
    ]);
    const steps: CapabilityPlanStep[] = [];
    const conflicts: string[] = [];
    const writes: CapabilityWrite[] = [];
    const dependencies = new Set<string>();
    const files = new Map<string, string>();
    const edits: CapabilityEdit[] = [];

    for (const op of capability.ops) {
        if (op.op === 'addDependency') {
            for (const name of op.packages) {
                if (declared.has(name)) {
                    steps.push({ op: 'addDependency', target: name, status: 'satisfied' });
                } else {
                    steps.push({ op: 'addDependency', target: name, status: 'pending' });
                    dependencies.add(name);
                }
            }
            continue;
        }
        if (op.op === 'writeFile') {
            const step = planWriteFile(capability, op.template, op.path, options, files, conflicts);
            steps.push(step);
            if (step.status === 'pending') {
                writes.push({ path: op.path, action: existsSync(join(options.dir, op.path)) ? 'update' : 'create' });
            }
            continue;
        }
        const step = planEditJson(op.path, op.pointer, op.value, options, edits, conflicts);
        steps.push(step);
    }

    return {
        plan: {
            capability: capability.id,
            mode: options.mode,
            steps,
            conflicts,
            writes,
            dependencies: [...dependencies],
            variables: options.variables,
        },
        files,
        edits,
    };
}

/**
 * Executes a plan. The caller must reject plans with conflicts first.
 *
 * @param execution - The plan and its rendered payloads.
 * @param options - Application directory and install policy.
 * @returns What was written, edited, and installed.
 */
export async function applyCapability(
    execution: CapabilityExecution,
    options: ApplyCapabilityOptions
): Promise<CapabilityApplyResult> {
    const planned = execution.plan.dependencies;
    const installed = options.skipInstall === true ? [] : [...planned];
    const skipped = options.skipInstall === true ? [...planned] : [];
    if (installed.length > 0) await addPackages(options.dir, installed, options.dependencyStdio ?? 'inherit');

    const written: string[] = [];
    for (const [target, content] of execution.files) {
        const absolute = join(options.dir, target);
        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, content, 'utf8');
        written.push(target);
    }

    const edited: string[] = [];
    for (const edit of execution.edits) {
        const absolute = join(options.dir, edit.path);
        const data = JSON.parse(readFileSync(absolute, 'utf8')) as Record<string, unknown>;
        setPointer(data, pointerSegments(edit.pointer), edit.value);
        writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
        edited.push(`${edit.path}#${edit.pointer}`);
    }

    return { written, edited, installed, skipped };
}

function planWriteFile(
    capability: CapabilityEntry,
    template: string,
    target: string,
    options: PlanCapabilityOptions,
    files: Map<string, string>,
    conflicts: string[]
): CapabilityPlanStep {
    if (!isSafeRelativePath(target)) {
        conflicts.push(`refusing to write outside the application: "${target}"`);
        return { op: 'writeFile', target, status: 'conflict' };
    }
    if (!isSafeRelativePath(template)) {
        conflicts.push(`invalid template path "${template}"`);
        return { op: 'writeFile', target, status: 'conflict' };
    }
    const source = join(CAPABILITIES_DIR, capability.id, template);
    if (!existsSync(source)) {
        conflicts.push(`missing template "${template}" for capability "${capability.id}"`);
        return { op: 'writeFile', target, status: 'conflict' };
    }

    const { content, missing } = renderTemplate(readFileSync(source, 'utf8'), options.variables);
    if (missing.length > 0) {
        for (const name of missing) {
            conflicts.push(`unresolved variable "{{${name}}}" in ${target} (pass --var ${name}=…)`);
        }
        return { op: 'writeFile', target, status: 'conflict' };
    }

    const absolute = join(options.dir, target);
    const existing = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
    if (existing === content) return { op: 'writeFile', target, status: 'satisfied' };
    if (existing !== null && options.force !== true) {
        conflicts.push(`${target} already exists with different content (use --force)`);
        return { op: 'writeFile', target, status: 'conflict' };
    }
    files.set(target, content);
    return { op: 'writeFile', target, status: 'pending' };
}

function planEditJson(
    path: string,
    pointer: string,
    value: unknown,
    options: PlanCapabilityOptions,
    edits: CapabilityEdit[],
    conflicts: string[]
): CapabilityPlanStep {
    const target = `${path}#${pointer}`;
    if (!isSafeRelativePath(path)) {
        conflicts.push(`refusing to edit outside the application: "${path}"`);
        return { op: 'editJson', target, status: 'conflict' };
    }
    const absolute = join(options.dir, path);
    if (!existsSync(absolute)) {
        conflicts.push(`${path} does not exist`);
        return { op: 'editJson', target, status: 'conflict' };
    }
    let data: unknown;
    try {
        data = JSON.parse(readFileSync(absolute, 'utf8'));
    } catch (error) {
        conflicts.push(`${path} is not valid JSON (${error instanceof Error ? error.message : String(error)})`);
        return { op: 'editJson', target, status: 'conflict' };
    }
    const segments = pointerSegments(pointer);
    const read = readPointer(data, segments);
    if (read.blockedAt !== undefined) {
        conflicts.push(`${target} cannot be set: /${read.blockedAt} is not an object`);
        return { op: 'editJson', target, status: 'conflict' };
    }
    if (read.exists && JSON.stringify(read.value) === JSON.stringify(value)) {
        return { op: 'editJson', target, status: 'satisfied' };
    }
    if (read.exists && options.force !== true) {
        conflicts.push(`${target} already has a different value (use --force)`);
        return { op: 'editJson', target, status: 'conflict' };
    }
    edits.push({ path, pointer, value });
    return { op: 'editJson', target, status: 'pending' };
}

/** Renders `{{name}}` placeholders and reports those without a value. */
function renderTemplate(
    text: string,
    variables: Readonly<Record<string, string>>
): { content: string; missing: string[] } {
    const missing = new Set<string>();
    const content = text.replace(/\{\{([a-z][a-zA-Z0-9]*)\}\}/gu, (match, name: string) => {
        const value = variables[name];
        if (value === undefined) {
            missing.add(name);
            return match;
        }
        return value;
    });
    return { content, missing: [...missing] };
}

/** Splits an RFC 6901 pointer into unescaped segments. */
function pointerSegments(pointer: string): string[] {
    return pointer
        .split('/')
        .slice(1)
        .map((segment) => segment.replace(/~1/gu, '/').replace(/~0/gu, '~'));
}

interface PointerRead {
    readonly exists: boolean;
    readonly value?: unknown;
    /** The first non-object parent, when the pointer cannot be traversed. */
    readonly blockedAt?: string;
}

function readPointer(root: unknown, segments: readonly string[]): PointerRead {
    let current: unknown = root;
    for (const [index, segment] of segments.entries()) {
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            return { exists: false, blockedAt: segments.slice(0, index).join('/') };
        }
        const record = current as Record<string, unknown>;
        if (!Object.hasOwn(record, segment)) return { exists: false };
        current = record[segment];
    }
    return { exists: true, value: current };
}

function setPointer(root: Record<string, unknown>, segments: readonly string[], value: unknown): void {
    let current = root;
    for (const segment of segments.slice(0, -1)) {
        const next = current[segment];
        if (next === undefined) {
            const created: Record<string, unknown> = {};
            current[segment] = created;
            current = created;
        } else if (typeof next === 'object' && next !== null && !Array.isArray(next)) {
            current = next as Record<string, unknown>;
        } else {
            throw new Error(`cannot set ${segments.join('/')}: ${segment} is not an object`);
        }
    }
    const last = segments.at(-1);
    if (last === undefined) throw new Error('cannot set the JSON root');
    current[last] = value;
}
