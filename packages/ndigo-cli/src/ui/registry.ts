/**
 * Loads and validates shadcn-compatible registry chunks from a local path or
 * an HTTP(S) URL. File bodies are read lazily so `list`/`view`/`validate` do
 * not fetch every payload.
 */
import { existsSync, readFileSync, statSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { usageError } from '../helpers/app-scripts.js';
import type { LoadedRegistry, LocatedRegistryItem, RegistryChunk, RegistryFile } from './registry-types.js';

/**
 * Reports whether a registry source is an HTTP(S) URL.
 * @param source - Registry source.
 * @returns True for `http://` and `https://`.
 */
export function isRemoteSource(source: string): boolean {
    return /^https?:\/\//u.test(source);
}

/**
 * Upper bound on the size of one fetched registry chunk, so a hostile or
 * misbehaving host cannot exhaust memory via a single response.
 */
const MAX_REGISTRY_BYTES = 10 * 1024 * 1024;

/**
 * Resolves a chunk-relative registry path and keeps it inside `rootSource`.
 * Absolute paths and symlink escapes are rejected, so a remote-provided
 * include or file path cannot read outside the selected registry.
 *
 * @param rootSource - Registry source file.
 * @param candidate - Registry path relative to the chunk or item's base.
 * @param readRoot - The registry source the file path was declared under.
 * @returns The canonical path, or the HTTP(S) URL when `candidate` is remote.
 */
function ensureRegistryPathInsideRoot(
    rootSource: string,
    base: string,
    candidate: string,
    scope: 'include' | 'item'
): string {
    if (isRemoteSource(candidate)) {
        const url = new URL(candidate);
        if (!/^https?:$/iu.test(url.protocol)) {
            throw usageError(`registry includes must use https or http: ${candidate}`);
        }
        return url.href;
    }
    if (isRemoteSource(base)) {
        return new URL(candidate, base).href;
    }
    const root = dirname(realpathSync(rootSource));
    const directory = scope === 'item' ? base : dirname(base);
    const absolute = resolve(isAbsolute(candidate) ? root : directory, candidate);
    if (!absolute.startsWith(root)) {
        throw usageError(`registry includes must stay within the selected registry: ${candidate}`);
    }
    const real = existsSync(absolute) ? realpathSync(absolute) : absolute;
    if (!real.startsWith(root)) {
        throw usageError(`registry includes must stay within the selected registry: ${candidate}`);
    }
    return real;
}

/**
 * Normalizes a registry source: relative paths become absolute, and a
 * directory resolves to its `registry.json`.
 * @param source - Registry file, directory, or URL.
 * @returns The normalized source.
 */
export function normalizeRegistrySource(source: string): string {
    if (isRemoteSource(source)) return source;
    const absolute = resolve(source);
    if (!existsSync(absolute)) throw usageError(`registry not found: ${absolute}`);
    return statSync(absolute).isDirectory() ? join(absolute, 'registry.json') : absolute;
}

/**
 * Loads a registry and every chunk it includes.
 * @param source - Registry file, directory, or URL.
 * @returns The merged registry.
 */
export async function loadRegistry(source: string): Promise<LoadedRegistry> {
    const normalized = normalizeRegistrySource(source);
    const items: LocatedRegistryItem[] = [];
    await loadChunk(normalized, normalized, new Set<string>(), items);
    return { source: normalized, items };
}

/**
 * Reads one item file, preferring inlined content over the path.
 * @param item - Item that declared the file.
 * @param file - File entry to read.
 * @returns The file body.
 */
export async function readRegistryFile(item: LocatedRegistryItem, file: RegistryFile): Promise<string> {
    if (file.content !== undefined) return file.content;
    const location = ensureRegistryPathInsideRoot(item.source, item.base, file.path, 'item');
    if (isRemoteSource(location)) {
        const response = await fetch(location, { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) {
            throw usageError(`registry file fetch failed (${response.status}): ${location}`);
        }
        const content = await response.text();
        if (Buffer.byteLength(content, 'utf8') > MAX_REGISTRY_BYTES) {
            throw usageError(`registry file is larger than the ${MAX_REGISTRY_BYTES} byte cap: ${location}`);
        }
        return content;
    }
    if (!existsSync(location)) throw usageError(`registry file not found: ${location}`);
    return readFileSync(location, 'utf8');
}

/**
 * Validates the merged registry shape and local file existence.
 * @param registry - Loaded registry.
 * @returns One message per problem; empty when valid.
 */
export function validateRegistry(registry: LoadedRegistry): string[] {
    const errors: string[] = [];
    const names = new Set<string>();
    for (const item of registry.items) {
        if (item.name.length === 0) {
            errors.push('item with an empty name');
            continue;
        }
        if (names.has(item.name)) errors.push(`duplicate item '${item.name}'`);
        names.add(item.name);
        if (item.type.length === 0) errors.push(`item '${item.name}' has no type`);
        for (const file of item.files ?? []) {
            errors.push(...validateFile(item, file));
        }
    }
    return errors;
}

/**
 * Resolves an item's registry dependencies in install order (dependencies
 * first), rejecting cycles and unknown names.
 * @param registry - Loaded registry.
 * @param names - Requested item names.
 * @returns Items in dependency-first order.
 */
export function resolveItemClosure(registry: LoadedRegistry, names: readonly string[]): LocatedRegistryItem[] {
    const byName = new Map(registry.items.map((item) => [item.name, item]));
    const resolved: LocatedRegistryItem[] = [];
    const done = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): void => {
        if (done.has(name)) return;
        if (visiting.has(name)) throw usageError(`registry dependency cycle at '${name}'`);
        const item = byName.get(name);
        if (!item) {
            throw usageError(`unknown registry item '${name}' (available: ${[...byName.keys()].sort().join(', ')})`);
        }
        visiting.add(name);
        for (const dependency of item.registryDependencies ?? []) {
            visit(normalizeDependencyName(dependency));
        }
        visiting.delete(name);
        done.add(name);
        resolved.push(item);
    };

    for (const name of names) visit(name);
    return resolved;
}

async function loadChunk(
    source: string,
    rootSource: string,
    seen: Set<string>,
    items: LocatedRegistryItem[]
): Promise<void> {
    if (seen.has(source)) return;
    seen.add(source);
    const chunk = isRemoteSource(source) ? await fetchChunk(source) : readChunk(source);
    const base = isRemoteSource(source) ? new URL('.', source).href : dirname(source);
    for (const item of chunk.items ?? []) {
        items.push({ ...item, base, source: rootSource });
    }
    for (const include of chunk.include ?? []) {
        const next = ensureRegistryPathInsideRoot(rootSource, source, include, 'include');
        // oxlint-disable-next-line no-await-in-loop -- includes must load in order so the shared cycle set sees each chunk
        await loadChunk(next, rootSource, seen, items);
    }
}

function readChunk(source: string): RegistryChunk {
    if (!existsSync(source)) throw usageError(`registry not found: ${source}`);
    try {
        return JSON.parse(readFileSync(source, 'utf8')) as RegistryChunk;
    } catch {
        throw usageError(`registry is not valid JSON: ${source}`);
    }
}

async function fetchChunk(source: string): Promise<RegistryChunk> {
    const response = await fetch(source, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw usageError(`registry fetch failed (${response.status}): ${source}`);
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_REGISTRY_BYTES) {
        throw usageError(`registry chunk is larger than the ${MAX_REGISTRY_BYTES} byte cap: ${source}`);
    }

    try {
        const content = await response.text();
        if (Buffer.byteLength(content, 'utf8') > MAX_REGISTRY_BYTES) {
            throw usageError(`registry chunk is larger than the ${MAX_REGISTRY_BYTES} byte cap: ${source}`);
        }
        return JSON.parse(content) as RegistryChunk;
    } catch {
        throw usageError(`registry is not valid JSON: ${source}`);
    }
}

function validateFile(item: LocatedRegistryItem, file: RegistryFile): string[] {
    const errors: string[] = [];
    const label = `${item.name} → ${file.path}`;
    if (file.path.length === 0) errors.push(`item '${item.name}' has a file with no path`);
    if (file.type.length === 0) errors.push(`item '${item.name}' file '${file.path}' has no type`);
    if ((file.type === 'registry:file' || file.type === 'registry:page') && file.target === undefined) {
        errors.push(`item '${item.name}' file '${file.path}' requires a target`);
    }
    if (file.content === undefined && !isRemoteSource(item.base)) {
        try {
            const location = ensureRegistryPathInsideRoot(item.source, item.base, file.path, 'item');
            if (!existsSync(location)) errors.push(`${label} does not exist`);
        } catch (error) {
            errors.push(`${label} ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return errors;
}

function normalizeDependencyName(dependency: string): string {
    if (isRemoteSource(dependency)) {
        throw usageError(`external registry dependencies are not supported yet: ${dependency}`);
    }
    return dependency.startsWith('@ndigo/') ? dependency.slice('@ndigo/'.length) : dependency;
}
