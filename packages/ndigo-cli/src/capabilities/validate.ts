/**
 * Reference-integrity checks for the capability catalog: ids, packages,
 * guides, skills, templates, checks, and the manifest/catalog back-reference.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CAPABILITIES_DIR, loadCheckIds, loadGuideSlugs, loadPackageFacts, loadSkillIds } from './catalog.js';
import type { CapabilityEntry, CatalogLoad, PackageFact } from './catalog.js';

/** Everything a catalog entry may reference, resolved once per check pass. */
export interface CatalogReferences {
    /** Guide slugs listed in the shipped docs index. */
    readonly guides: ReadonlySet<string>;
    /** Skill ids shipped with the CLI. */
    readonly skills: ReadonlySet<string>;
    /** Package facts declared by the `ndigo` manifest blocks. */
    readonly packages: ReadonlyMap<string, PackageFact>;
    /** Check ids in the declared check vocabulary. */
    readonly checks: ReadonlySet<string>;
}

/** The resolved reference sets plus any read errors from the generated indexes. */
export interface CatalogReferenceLoad {
    /** The sets a catalog validates against. */
    readonly references: CatalogReferences;
    /** Problems reading the generated `packages.json`, empty when current. */
    readonly errors: readonly string[];
}

/**
 * Resolves the reference sets the catalog validates against.
 *
 * @returns The guides, skills, package facts, and checks shipped with the CLI.
 */
export function loadCatalogReferences(): CatalogReferenceLoad {
    const errors: string[] = [];
    const packages = loadPackageFacts(errors);
    return {
        references: {
            guides: new Set(loadGuideSlugs()),
            skills: new Set(loadSkillIds()),
            packages: new Map(packages.map((fact) => [fact.name, fact])),
            checks: new Set(loadCheckIds()),
        },
        errors,
    };
}

/**
 * Validates a loaded catalog against the shipped reference sets.
 *
 * @param catalog - The loaded capabilities and items.
 * @param references - The reference sets to resolve against.
 * @returns Human-readable problems; empty when the catalog is consistent.
 */
export function validateCatalog(catalog: CatalogLoad, references: CatalogReferences): string[] {
    const problems = [...catalog.errors];
    const seen = new Map<string, string>();

    for (const capability of catalog.capabilities) {
        const previous = seen.get(capability.id);
        if (previous !== undefined) problems.push(`duplicate id "${capability.id}" (${previous} and capability)`);
        seen.set(capability.id, 'capability');

        if (!references.guides.has(capability.guide)) {
            problems.push(`capability "${capability.id}" names unknown guide "${capability.guide}"`);
        }
        if (capability.skill !== undefined && !references.skills.has(capability.skill)) {
            problems.push(`capability "${capability.id}" names unknown skill "${capability.skill}"`);
        }
        for (const check of capability.checks) {
            const id = check.split(':')[0] ?? check;
            if (!references.checks.has(id)) {
                problems.push(`capability "${capability.id}" names unknown check "${check}"`);
            }
        }
        for (const package_ of capability.packages) {
            const fact = references.packages.get(package_);
            if (fact === undefined) {
                problems.push(`capability "${capability.id}" names unknown package "${package_}"`);
            } else if (!fact.capabilities.includes(capability.id)) {
                problems.push(
                    `capability "${capability.id}" names ${package_}, but its manifest does not declare the capability`
                );
            }
        }
        validateOps(capability, problems);
    }

    for (const item of catalog.items) {
        const previous = seen.get(item.id);
        if (previous !== undefined) problems.push(`duplicate id "${item.id}" (${previous} and item)`);
        seen.set(item.id, 'item');
    }

    for (const fact of references.packages.values()) {
        for (const id of fact.capabilities) {
            const capability = catalog.capabilities.find((candidate) => candidate.id === id);
            if (capability === undefined) {
                problems.push(`package ${fact.name} declares unknown capability "${id}"`);
            } else if (!capability.packages.includes(fact.name)) {
                problems.push(`package ${fact.name} declares "${id}", but the capability does not name the package`);
            }
        }
    }
    return problems;
}

function validateOps(capability: CapabilityEntry, problems: string[]): void {
    for (const op of capability.ops) {
        if (op.op === 'addDependency') {
            for (const package_ of op.packages) {
                if (!isPackageName(package_))
                    problems.push(`capability "${capability.id}" adds invalid package "${package_}"`);
            }
        } else if (op.op === 'writeFile') {
            if (!isSafeRelativePath(op.path)) {
                problems.push(`capability "${capability.id}" writes outside the app: "${op.path}"`);
            }
            if (!isSafeRelativePath(op.template)) {
                problems.push(`capability "${capability.id}" has an invalid template path "${op.template}"`);
            } else if (!existsSync(join(CAPABILITIES_DIR, capability.id, op.template))) {
                problems.push(`capability "${capability.id}" is missing template "${op.template}"`);
            }
        } else {
            if (!isSafeRelativePath(op.path)) {
                problems.push(`capability "${capability.id}" edits outside the app: "${op.path}"`);
            }
            if (!op.pointer.startsWith('/')) {
                problems.push(`capability "${capability.id}" has an invalid JSON pointer "${op.pointer}"`);
            }
        }
    }
}

function isSafeRelativePath(path: string): boolean {
    if (path === '' || path.startsWith('/') || path.includes('\\')) return false;
    return path.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

function isPackageName(value: string): boolean {
    return /^@ndigo\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(value);
}
