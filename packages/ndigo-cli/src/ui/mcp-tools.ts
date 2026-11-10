/**
 * Registry operations behind the `ndigo ui mcp` tools: discovery, inspection,
 * install planning, and validation.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { resolveAppDir } from '../helpers/app-scripts.js';
import { resolveAliases, resolveRegistrySource } from './config.js';
import { applyInstall, planInstall } from './install.js';
import { buildCatalog, readInstalledItems, readInstalledRegistry } from './catalog.js';
import { isRemoteSource, loadRegistry, normalizeRegistrySource, validateRegistry } from './registry.js';
import type { LoadedRegistry, LocatedRegistryItem } from './registry-types.js';

/** Server-wide registry context. */
export interface RegistryToolContext {
    /** Application directory used for relative registry paths. */
    readonly dir: string;
    /** Default registry source (file, directory, or URL). */
    readonly registry?: string;
}

/** Optional filters for {@link listItems}. */
export interface ItemFilters {
    /** Exact registry type, e.g. `registry:ui`. */
    readonly type?: string;
    /** Category membership, e.g. `form`. */
    readonly category?: string;
    /** Case-insensitive text filter. */
    readonly query?: string;
}

interface Loaded {
    readonly registry: LoadedRegistry;
    readonly source: string;
}

/** Request for {@link installItems}. */
export interface InstallRequest {
    /** Registry item names to install. */
    readonly items: readonly string[];
    /** Application directory (defaults to the context directory). */
    readonly dir?: string;
    /** Registry source override. */
    readonly registry?: string;
    /** Plan only (default true). */
    readonly dryRun?: boolean;
    /** Replace files that differ from the registry content. */
    readonly overwrite?: boolean;
    /** Write files without installing npm dependencies. */
    readonly skipInstall?: boolean;
}

/**
 * Lists registry items, optionally filtered by type, category, or text.
 * @param context - Registry context.
 * @param filters - Optional filters.
 * @returns The source and compact item records.
 */
export async function listItems(context: RegistryToolContext, filters: ItemFilters & { registry?: string }) {
    const { registry, source } = await loadFor(context, filters.registry);
    const items = filterItems(registry.items, filters).map(compactItem);
    return { source, count: items.length, items };
}

/**
 * Searches items by name, title, description, docs, or category.
 * @param context - Registry context.
 * @param query - Search text.
 * @param limit - Maximum results (default 10).
 * @param override - Optional registry source override.
 * @returns Ranked matches.
 */
export async function searchItems(context: RegistryToolContext, query: string, limit = 10, override?: string) {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) throw new Error('query must not be empty');
    const { registry, source } = await loadFor(context, override);
    const results = registry.items
        .map((item) => ({ item, score: scoreItem(item, needle) }))
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name))
        .slice(0, limit)
        .map(({ item, score }) => ({ ...compactItem(item), score }));
    return { source, query, count: results.length, results };
}

/**
 * Returns one item's metadata, targets, dependencies, docs, and README.
 * @param context - Registry context.
 * @param request - Item name, optional README switch, and registry override.
 * @returns The item record and README body when available.
 */
export async function getItem(
    context: RegistryToolContext,
    request: { readonly name: string; readonly includeReadme?: boolean; readonly registry?: string }
) {
    const { registry, source } = await loadFor(context, request.registry);
    const item = registry.items.find((candidate) => candidate.name === request.name);
    if (item === undefined) throw new Error(`unknown registry item '${request.name}'`);
    return {
        source,
        item: {
            ...compactItem(item),
            author: item.author,
            docs: item.docs,
            dependencies: item.dependencies,
            files: (item.files ?? []).map((file) => ({ path: file.path, type: file.type, target: file.target })),
        },
        readme: request.includeReadme === false ? undefined : readReadme(item),
    };
}

/**
 * Plans or applies a registry install into an application.
 * @param context - Registry context.
 * @param request - Items, target directory, and install flags.
 * @returns The plan and the installer result (a dry run by default).
 */
export async function installItems(context: RegistryToolContext, request: InstallRequest) {
    const dir = resolveAppDir(request.dir ?? context.dir);
    const { registry, source } = await loadFor({ dir, registry: context.registry }, request.registry);
    const plan = await planInstall(registry, request.items, resolveAliases(dir));
    const dryRun = request.dryRun !== false;
    const result = await applyInstall(plan, {
        dir,
        dryRun,
        overwrite: request.overwrite === true,
        install: request.skipInstall !== true,
        dependencyStdio: 'stderr',
    });
    return {
        dryRun,
        source,
        dir,
        items: plan.items,
        files: plan.files.map((file) => ({ item: file.item, target: file.target, sha256: file.sha256 })),
        dependencies: plan.dependencies,
        written: result.written,
        unchanged: result.unchanged,
        lockPath: result.lockPath,
    };
}

/**
 * Validates a registry source without throwing on shape errors.
 * @param context - Registry context.
 * @param override - Optional registry source override.
 * @returns Validity, item count, and errors.
 */
export async function validateRegistrySource(context: RegistryToolContext, override?: string) {
    const source = registrySourceFor(context.dir, context.registry, override);
    const registry = await loadRegistry(source);
    const errors = validateRegistry(registry);
    return { source, valid: errors.length === 0, items: registry.items.length, errors };
}

/**
 * Returns the A2UI catalog of installed renderable registry items.
 *
 * @param context - Registry context.
 * @param override - Optional registry source override.
 * @returns The registry source, installed item names, and the catalog.
 */
export async function getCatalog(context: RegistryToolContext, override?: string) {
    const installed = readInstalledItems(context.dir);
    const fallback = context.registry ?? readInstalledRegistry(context.dir);
    const { registry, source } = await loadFor(
        fallback === undefined ? context : { ...context, registry: fallback },
        override
    );
    return { source, installed, catalog: buildCatalog(registry, installed) };
}

async function loadFor(context: RegistryToolContext, override: string | undefined): Promise<Loaded> {
    const source = registrySourceFor(context.dir, context.registry, override);
    const registry = await loadRegistry(source);
    const errors = validateRegistry(registry);
    if (errors.length > 0) throw new Error(`registry validation failed:\n  ${errors.join('\n  ')}`);
    return { registry, source };
}

function registrySourceFor(dir: string, fallback: string | undefined, override: string | undefined): string {
    const candidate = override ?? fallback;
    if (candidate === undefined) return resolveRegistrySource(dir);
    if (isRemoteSource(candidate)) return candidate;
    return normalizeRegistrySource(resolve(dir, candidate));
}

function filterItems(items: readonly LocatedRegistryItem[], filters: ItemFilters): LocatedRegistryItem[] {
    const needle = filters.query?.trim().toLowerCase();
    return items
        .filter((item) => {
            if (filters.type !== undefined && item.type !== filters.type) return false;
            if (filters.category !== undefined && !(item.categories ?? []).includes(filters.category)) return false;
            if (needle === undefined || needle.length === 0) return true;
            return haystack(item).includes(needle);
        })
        .sort((left, right) => left.name.localeCompare(right.name));
}

function scoreItem(item: LocatedRegistryItem, needle: string): number {
    const name = item.name.toLowerCase();
    if (name === needle) return 100;
    if (name.startsWith(needle)) return 80;
    if (name.includes(needle)) return 60;
    return haystack(item).includes(needle) ? 20 : 0;
}

function haystack(item: LocatedRegistryItem): string {
    return [item.name, item.title, item.description, item.docs, ...(item.categories ?? [])]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase();
}

function compactItem(item: LocatedRegistryItem) {
    return {
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        categories: item.categories,
        registryDependencies: item.registryDependencies,
    };
}

function readReadme(item: LocatedRegistryItem): string | undefined {
    if (isRemoteSource(item.base)) return undefined;
    const first = item.files?.[0];
    if (first === undefined) return undefined;
    const path = join(item.base, dirname(first.path), 'README.md');
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}
