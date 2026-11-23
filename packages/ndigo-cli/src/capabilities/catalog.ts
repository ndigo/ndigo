/**
 * The declared capability catalog shipped beside the CLI: loading the authored
 * `capability.json` files, the generated package/UI-item indexes, and the
 * merged discovery view an authoring agent reads.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/**
 * The catalog directory. Resolved from both layouts (`src/capabilities` and
 * `lib/capabilities` sit two levels below the package root), mirroring the
 * agent-content loader.
 */
export const CAPABILITIES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'capabilities');

/** The agent-content assets (`docs-index.md`, `skills/`) shipped beside the catalog. */
export const AGENT_ASSETS_DIR = join(CAPABILITIES_DIR, '..', 'agent');

/** Kebab-case identifiers: capability ids, skills, checks, and surfaces. */
const kebabPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/** Guide slugs carry their numeric prefix (`48-agent-facing-surfaces`). */
const guidePattern = /^[a-z0-9][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/** Package names the catalog may point at. */
const packagePattern = /^@ndigo\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/** A check reference: `id` or `id:target` (`route-parity:*`, `mcp-stdio:tools/list`). */
const checkPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?::\S+)?$/u;

const kebab = z.string().regex(kebabPattern, 'expected kebab-case');
const guideSlug = z.string().regex(guidePattern, 'expected a guide slug');
const packageName = z.string().regex(packagePattern, 'expected @ndigo/<kebab-case>');

const addDependencyOp = z.strictObject({
    op: z.literal('addDependency'),
    packages: z.array(packageName).min(1),
});

const writeFileOp = z.strictObject({
    op: z.literal('writeFile'),
    template: z.string().min(1),
    path: z.string().min(1),
});

const editJsonOp = z.strictObject({
    op: z.literal('editJson'),
    path: z.string().min(1),
    pointer: z.string().regex(/^\//u, 'expected a JSON pointer starting with "/"'),
    value: z.unknown(),
});

const capabilityOpSchema = z.discriminatedUnion('op', [addDependencyOp, writeFileOp, editJsonOp]);

const capabilityVariableSchema = z.strictObject({
    name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/u, 'expected camelCase'),
    description: z.string().min(1),
    default: z.string().optional(),
});

const capabilitySchema = z.strictObject({
    id: kebab,
    kind: z.literal('capability'),
    summary: z.string().min(1).max(160),
    packages: z.array(packageName).min(1),
    guide: guideSlug,
    skill: kebab.optional(),
    variables: z.array(capabilityVariableSchema).optional(),
    ops: z.array(capabilityOpSchema).min(1),
    checks: z.array(z.string().regex(checkPattern, 'expected id or id:target')),
});

const itemSchema = z.strictObject({
    kind: z.literal('item'),
    id: kebab,
    type: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1).optional(),
    categories: z.array(z.string().min(1)).optional(),
});

const packageFactSchema = z.strictObject({
    name: packageName,
    description: z.string().min(1),
    capabilities: z.array(kebab),
    surfaces: z.array(kebab),
    skill: kebab.optional(),
});

const packagesFileSchema = z.strictObject({ packages: z.array(packageFactSchema) });
const itemsFileSchema = z.strictObject({ items: z.array(itemSchema) });
const checksFileSchema = z.strictObject({ checks: z.array(z.strictObject({ id: kebab, summary: z.string().min(1) })) });

/** One declared wiring operation. */
export type CapabilityOp = z.infer<typeof capabilityOpSchema>;

/** One authored capability entry. */
export type CapabilityEntry = z.infer<typeof capabilitySchema>;

/** One UI registry item projected into the discovery index. */
export type CatalogItem = z.infer<typeof itemSchema>;

/** Facts a package declares about itself in its manifest `ndigo` block. */
export type PackageFact = z.infer<typeof packageFactSchema>;

/** The result of loading the catalog: valid entries plus validation errors. */
export interface CatalogLoad {
    /** Capability entries, sorted by id. */
    readonly capabilities: readonly CapabilityEntry[];
    /** UI item entries, sorted by id. */
    readonly items: readonly CatalogItem[];
    /** Shape and identity errors encountered while reading. */
    readonly errors: readonly string[];
}

/** One compact discovery record. */
export interface CatalogListEntry {
    /** Capability or item id. */
    readonly id: string;
    /** Which install mechanism owns the entry. */
    readonly kind: 'capability' | 'item';
    /** One-line summary. */
    readonly summary: string;
    /** The install command; UI items only, since capability apply lands in P2. */
    readonly install?: string;
    /** The packages a capability is composed from; capabilities only. */
    readonly packages?: readonly string[];
}

/** A resolved entry, ready to return from `get`. */
export interface CatalogDetail extends CatalogListEntry {
    /** The full authored record (ops, checks, packages, guide, skill, type, categories). */
    readonly record: CapabilityEntry | CatalogItem;
}

/**
 * Reads the committed capability catalog.
 *
 * Errors are returned, not thrown: `ndigo capabilities check` reports every
 * problem at once, while the list/get verbs fail with the first aggregate.
 *
 * @returns The valid entries and every error encountered.
 */
export function loadCatalog(): CatalogLoad {
    const errors: string[] = [];
    const capabilities = readCapabilities(errors);
    const items = readItemsIndex(errors);
    return { capabilities, items, errors };
}

/**
 * Loads the catalog and throws when any entry is invalid.
 *
 * @returns The valid catalog.
 */
export function loadCatalogOrThrow(): CatalogLoad {
    const catalog = loadCatalog();
    if (catalog.errors.length > 0) {
        throw new Error(`capability catalog is invalid:\n  ${catalog.errors.join('\n  ')}`);
    }
    return catalog;
}

/**
 * Lists capabilities and UI items in one stable, sorted index.
 *
 * @returns The compact discovery records, sorted by id then kind.
 */
export function listCatalog(): CatalogListEntry[] {
    const catalog = loadCatalogOrThrow();
    return buildList(catalog);
}

/**
 * Resolves one capability or UI item by id.
 *
 * @param id - The capability or item id.
 * @returns The compact record plus the full authored entry, or undefined.
 */
export function getCatalogEntry(id: string): CatalogDetail | undefined {
    const catalog = loadCatalogOrThrow();
    return buildEntries(catalog).find((entry) => entry.id === id);
}

/**
 * Reads the generated package-fact index (the `ndigo` manifest blocks).
 *
 * @param errors - Collected when the file is missing or malformed.
 * @returns Package facts sorted by name.
 */
export function loadPackageFacts(errors: string[] = []): PackageFact[] {
    const file = join(CAPABILITIES_DIR, 'packages.json');
    if (!existsSync(file)) {
        errors.push('missing generated packages.json — run `pnpm agent-content:build`');
        return [];
    }
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
        errors.push(`packages.json: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
    const parsed = packagesFileSchema.safeParse(raw);
    if (!parsed.success) {
        errors.push(`packages.json: ${formatIssues(parsed.error)}`);
        return [];
    }
    return [...parsed.data.packages].sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Reads the declared check vocabulary.
 *
 * @returns Check ids in file order, empty when the file is missing.
 */
export function loadCheckIds(): string[] {
    const file = join(CAPABILITIES_DIR, 'checks.json');
    if (!existsSync(file)) return [];
    try {
        const parsed = checksFileSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
        return parsed.success ? parsed.data.checks.map((check) => check.id) : [];
    } catch {
        return [];
    }
}

/**
 * Reads the guide slugs listed in the shipped docs index.
 *
 * @returns Guide slugs, empty when the index is missing.
 */
export function loadGuideSlugs(): string[] {
    const file = join(AGENT_ASSETS_DIR, 'docs-index.md');
    if (!existsSync(file)) return [];
    const slugs: string[] = [];
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        // Guide slugs carry a numeric prefix; capability and package lines do not.
        const match = /^- `(\d[^`]*)` — /u.exec(line);
        if (match?.[1] !== undefined) slugs.push(match[1]);
    }
    return slugs;
}

/**
 * Reads the skill ids shipped with the CLI.
 *
 * @returns Skill ids, sorted.
 */
export function loadSkillIds(): string[] {
    const dir = join(AGENT_ASSETS_DIR, 'skills');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter((entry) => existsSync(join(dir, entry, 'SKILL.md')))
        .sort();
}

function readCapabilities(errors: string[]): CapabilityEntry[] {
    if (!existsSync(CAPABILITIES_DIR)) {
        errors.push('missing capability catalog directory');
        return [];
    }
    const capabilities: CapabilityEntry[] = [];
    for (const directory of readdirSync(CAPABILITIES_DIR).sort()) {
        const file = join(CAPABILITIES_DIR, directory, 'capability.json');
        if (!existsSync(file)) continue;
        let raw: unknown;
        try {
            raw = JSON.parse(readFileSync(file, 'utf8'));
        } catch (error) {
            errors.push(`${directory}/capability.json: ${error instanceof Error ? error.message : String(error)}`);
            continue;
        }
        const parsed = capabilitySchema.safeParse(raw);
        if (!parsed.success) {
            errors.push(`${directory}/capability.json: ${formatIssues(parsed.error)}`);
            continue;
        }
        if (parsed.data.id !== directory) {
            errors.push(`${directory}/capability.json: id "${parsed.data.id}" must match its directory`);
            continue;
        }
        capabilities.push(parsed.data);
    }
    return capabilities.sort((left, right) => left.id.localeCompare(right.id));
}

function readItemsIndex(errors: string[]): CatalogItem[] {
    const file = join(CAPABILITIES_DIR, 'items.json');
    if (!existsSync(file)) {
        errors.push('missing generated items.json — run `pnpm agent-content:build`');
        return [];
    }
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
        errors.push(`items.json: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
    const parsed = itemsFileSchema.safeParse(raw);
    if (!parsed.success) {
        errors.push(`items.json: ${formatIssues(parsed.error)}`);
        return [];
    }
    return [...parsed.data.items].sort((left, right) => left.id.localeCompare(right.id));
}

function buildList(catalog: CatalogLoad): CatalogListEntry[] {
    return buildEntries(catalog).map(({ id, kind, summary, install, packages }) => ({
        id,
        kind,
        summary,
        ...(install === undefined ? {} : { install }),
        ...(packages === undefined ? {} : { packages }),
    }));
}

function buildEntries(catalog: CatalogLoad): CatalogDetail[] {
    const entries: CatalogDetail[] = [
        ...catalog.capabilities.map((capability) => ({
            id: capability.id,
            kind: 'capability' as const,
            summary: capability.summary,
            packages: capability.packages,
            record: capability,
        })),
        ...catalog.items.map((item) => ({
            id: item.id,
            kind: 'item' as const,
            summary: item.summary ?? item.title,
            install: `ndigo ui add ${item.id}`,
            record: item,
        })),
    ];
    return entries.sort((left, right) => left.id.localeCompare(right.id) || left.kind.localeCompare(right.kind));
}

function formatIssues(error: z.ZodError): string {
    return error.issues
        .map((issue) => `${issue.path.length === 0 ? '<root>' : issue.path.join('.')}: ${issue.message}`)
        .join('; ');
}
