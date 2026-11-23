/**
 * Capability catalog inputs and validation for the agent-content pipeline.
 *
 * The catalog is authored data — `capability.json` plus templates — under the
 * CLI's shipped assets. This module reads it without booting the CLI or
 * importing TypeScript, so `build.mjs` and `check-manifests.mjs` can validate
 * it in the ordinary tooling lane.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const kebabPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
// Guide slugs carry their numeric prefix (`48-agent-facing-surfaces`).
const guidePattern = /^[a-z0-9][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const packagePattern = /^@ndigo\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const checkPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?::\S+)?$/u;

/** Capability keys, in the authored order the docs render. */
const CAPABILITY_KEYS = new Set(['id', 'kind', 'summary', 'packages', 'guide', 'skill', 'variables', 'ops', 'checks']);

/** Manifest `ndigo` block keys. */
const BLOCK_KEYS = new Set(['surfaces', 'capabilities', 'skill']);

/**
 * Reads every authored `capability.json` under the catalog directory.
 *
 * @param {string} catalogDir - absolute path to `assets/capabilities`.
 * @returns {{ capabilities: object[], errors: string[] }} sorted entries and shape errors.
 */
export function readCapabilityCatalog(catalogDir) {
    const errors = [];
    const capabilities = [];
    if (!existsSync(catalogDir)) {
        return { capabilities, errors: [`missing capability catalog: ${catalogDir}`] };
    }
    for (const directory of readdirSync(catalogDir).sort()) {
        const file = join(catalogDir, directory, 'capability.json');
        if (!existsSync(file)) continue;
        let data;
        try {
            data = JSON.parse(readFileSync(file, 'utf8'));
        } catch (error) {
            errors.push(`${directory}/capability.json: ${error.message}`);
            continue;
        }
        const problems = capabilityShapeProblems(data, directory);
        if (problems.length > 0) {
            errors.push(...problems.map((problem) => `${directory}/capability.json: ${problem}`));
            continue;
        }
        capabilities.push(data);
    }
    return { capabilities: capabilities.sort((left, right) => left.id.localeCompare(right.id)), errors };
}

/**
 * Reads the declared check vocabulary.
 *
 * @param {string} catalogDir - absolute path to `assets/capabilities`.
 * @returns {Set<string>} check ids.
 */
export function readCheckIds(catalogDir) {
    const file = join(catalogDir, 'checks.json');
    if (!existsSync(file)) return new Set();
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return new Set((parsed.checks ?? []).map((check) => check.id));
}

/**
 * Validates a manifest `ndigo` block.
 *
 * @param {unknown} block - the `ndigo` value from `package.json`.
 * @param {{ packageName: string, capabilityIds: Set<string>, skillIds: Set<string> }} context - package identity and known ids.
 * @returns {string[]} problems; empty when the block is valid.
 */
export function ndigoBlockProblems(block, context) {
    if (typeof block !== 'object' || block === null || Array.isArray(block)) {
        return ['ndigo must be an object'];
    }
    const problems = [];
    for (const key of Object.keys(block)) {
        if (!BLOCK_KEYS.has(key)) problems.push(`ndigo.${key} is not a known key`);
    }
    if (Object.keys(block).length === 0) problems.push('ndigo must declare at least one key');
    for (const key of ['surfaces', 'capabilities']) {
        const value = block[key];
        if (value === undefined) continue;
        if (!Array.isArray(value) || value.length === 0) {
            problems.push(`ndigo.${key} must be a non-empty array`);
            continue;
        }
        const seen = new Set();
        for (const entry of value) {
            if (typeof entry !== 'string' || !kebabPattern.test(entry)) {
                problems.push(`ndigo.${key} entry "${String(entry)}" must be kebab-case`);
            } else if (seen.has(entry)) {
                problems.push(`ndigo.${key} repeats "${entry}"`);
            } else {
                seen.add(entry);
            }
        }
    }
    if (block.skill !== undefined) {
        if (typeof block.skill !== 'string' || !kebabPattern.test(block.skill)) {
            problems.push('ndigo.skill must be a kebab-case skill id');
        } else if (!context.skillIds.has(block.skill)) {
            problems.push(`ndigo.skill names unknown skill "${block.skill}"`);
        }
    }
    for (const id of Array.isArray(block.capabilities) ? block.capabilities : []) {
        if (!context.capabilityIds.has(id)) {
            problems.push(`ndigo.capabilities names unknown capability "${id}"`);
        }
    }
    for (const id of Array.isArray(block.capabilities) ? block.capabilities : []) {
        const capability = context.capabilities?.find((entry) => entry.id === id);
        if (capability !== undefined && !capability.packages.includes(context.packageName)) {
            problems.push(`capability "${id}" does not name ${context.packageName}`);
        }
    }
    return problems;
}

/**
 * Cross-checks the catalog, manifests, guides, skills, checks, and templates.
 *
 * @param {object} input - root, catalog directory, loaded catalog, packages, and skills.
 * @returns {string[]} problems; empty when the catalog is consistent.
 */
export function capabilityProblems(input) {
    const { root, catalogDir, catalog, packages, skills } = input;
    const problems = [...catalog.errors];
    const factsByName = new Map();
    const packageNames = new Set(packages.map((pkg) => pkg.manifest.name));
    const skillIds = new Set(skills.map((skill) => skill.id));
    const capabilityIds = new Set(catalog.capabilities.map((capability) => capability.id));

    for (const pkg of packages) {
        if (pkg.manifest.ndigo === undefined) continue;
        for (const problem of ndigoBlockProblems(pkg.manifest.ndigo, {
            packageName: pkg.manifest.name,
            capabilityIds,
            skillIds,
            capabilities: catalog.capabilities,
        })) {
            problems.push(`${pkg.manifest.name}: ${problem}`);
        }
        factsByName.set(pkg.manifest.name, pkg.manifest.ndigo);
    }

    const seen = new Map();
    const checkIds = readCheckIds(catalogDir);
    for (const capability of catalog.capabilities) {
        const previous = seen.get(capability.id);
        if (previous !== undefined) problems.push(`duplicate id "${capability.id}" (${previous} and capability)`);
        seen.set(capability.id, 'capability');

        if (!existsSync(join(root, 'docs', 'guides', `${capability.guide}.md`))) {
            problems.push(`capability "${capability.id}" names unknown guide "${capability.guide}"`);
        }
        if (capability.skill !== undefined && !skillIds.has(capability.skill)) {
            problems.push(`capability "${capability.id}" names unknown skill "${capability.skill}"`);
        }
        for (const check of capability.checks) {
            const id = check.split(':')[0];
            if (!checkIds.has(id)) problems.push(`capability "${capability.id}" names unknown check "${check}"`);
        }
        for (const packageName of capability.packages) {
            if (!packageNames.has(packageName)) {
                problems.push(`capability "${capability.id}" names unknown package "${packageName}"`);
            } else if (!factsByName.has(packageName)) {
                problems.push(`capability "${capability.id}" names package "${packageName}" with no ndigo block`);
            } else if (!factsByName.get(packageName).capabilities.includes(capability.id)) {
                problems.push(`capability "${capability.id}" names ${packageName}, but its ndigo block omits it`);
            }
        }
        const writes = new Set();
        const edits = new Set();
        for (const op of capability.ops) {
            if (op.op === 'writeFile') {
                if (writes.has(op.path)) problems.push(`capability "${capability.id}" writes "${op.path}" twice`);
                writes.add(op.path);
                if (!isSafeRelativePath(op.path)) {
                    problems.push(`capability "${capability.id}" writes outside the app: "${op.path}"`);
                }
                if (!isSafeRelativePath(op.template)) {
                    problems.push(`capability "${capability.id}" has an invalid template path "${op.template}"`);
                } else if (!existsSync(join(catalogDir, capability.id, op.template))) {
                    problems.push(`capability "${capability.id}" is missing template "${op.template}"`);
                } else {
                    problems.push(
                        ...templateProblems(capability, join(catalogDir, capability.id, op.template), op.template)
                    );
                }
            } else if (op.op === 'editJson') {
                const target = `${op.path}#${op.pointer}`;
                if (edits.has(target)) problems.push(`capability "${capability.id}" edits "${target}" twice`);
                edits.add(target);
                if (!isSafeRelativePath(op.path)) {
                    problems.push(`capability "${capability.id}" edits outside the app: "${op.path}"`);
                }
                if (!op.pointer.startsWith('/')) {
                    problems.push(`capability "${capability.id}" has an invalid JSON pointer "${op.pointer}"`);
                }
            }
        }
    }

    for (const [packageName, block] of factsByName) {
        for (const id of block.capabilities) {
            const capability = catalog.capabilities.find((entry) => entry.id === id);
            if (capability === undefined) {
                problems.push(`${packageName} declares unknown capability "${id}"`);
            } else if (!capability.packages.includes(packageName)) {
                problems.push(`${packageName} declares "${id}", but the capability does not name the package`);
            }
        }
    }

    return problems;
}

/**
 * Serializes the package facts declared by the `ndigo` blocks.
 *
 * @param {object[]} packages - workspace packages.
 * @returns {{ packages: object[] }} the shipped package-fact index.
 */
export function packageFacts(packages) {
    return {
        packages: packages
            .filter((pkg) => pkg.manifest.ndigo !== undefined)
            .map((pkg) => ({
                name: pkg.manifest.name,
                description: pkg.manifest.description,
                capabilities: [...(pkg.manifest.ndigo.capabilities ?? [])].sort((a, b) => a.localeCompare(b)),
                surfaces: [...(pkg.manifest.ndigo.surfaces ?? [])].sort((a, b) => a.localeCompare(b)),
                ...(pkg.manifest.ndigo.skill === undefined ? {} : { skill: pkg.manifest.ndigo.skill }),
                ...(pkg.manifest.ndigo.skill === undefined ? {} : { skill: pkg.manifest.ndigo.skill }),
            }))
            .sort((left, right) => left.name.localeCompare(right.name)),
    };
}

/**
 * Projects the UI registry into the discovery index shipped with the CLI.
 *
 * @param {string} root - repository root.
 * @returns {{ items: object[] }} sorted UI items, without file contents.
 */
export function uiItems(root) {
    const registry = JSON.parse(readFileSync(join(root, 'packages', 'ndigo-ui', 'registry.json'), 'utf8'));
    const seen = new Set();
    const items = [];
    for (const item of registry.items ?? []) {
        if (typeof item.name !== 'string' || typeof item.type !== 'string') continue;
        if (seen.has(item.name)) throw new Error(`duplicate UI registry item "${item.name}"`);
        seen.add(item.name);
        items.push({
            kind: 'item',
            id: item.name,
            type: item.type,
            title: typeof item.title === 'string' ? item.title : item.name,
            ...(typeof item.description === 'string' && item.description !== '' ? { summary: item.description } : {}),
            ...(Array.isArray(item.categories) && item.categories.length > 0
                ? { categories: [...item.categories].sort((a, b) => a.localeCompare(b)) }
                : {}),
        });
    }
    return { items: items.sort((left, right) => left.id.localeCompare(right.id)) };
}

/**
 * Renders one capability line for `docs-index.md` and `llms.txt`.
 *
 * @param {object} capability - one catalog entry.
 * @returns {string} a single Markdown list item.
 */
export function renderCapabilityLine(capability) {
    const skill = capability.skill === undefined ? '' : ` Skill: \`${capability.skill}\`.`;
    const packages = capability.packages.map((name) => `\`${name}\``).join(', ');
    return `- \`${capability.id}\` — ${capability.summary} Packages: ${packages}. Guide: \`${capability.guide}\`.${skill}`;
}

function capabilityShapeProblems(data, directory) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return ['expected a JSON object'];
    const problems = [];
    for (const key of Object.keys(data)) {
        if (!CAPABILITY_KEYS.has(key)) problems.push(`${key} is not a known key`);
    }
    if (data.id !== directory) problems.push(`id "${String(data.id)}" must match its directory "${directory}"`);
    if (data.kind !== 'capability') problems.push('kind must be "capability"');
    if (typeof data.summary !== 'string' || data.summary.length === 0 || data.summary.length > 160) {
        problems.push('summary must be 1–160 characters');
    }
    if (!Array.isArray(data.packages) || data.packages.length === 0) {
        problems.push('packages must be a non-empty array');
    } else if (!data.packages.every((entry) => typeof entry === 'string' && packagePattern.test(entry))) {
        problems.push('packages entries must be @ndigo/<kebab-case>');
    }
    if (typeof data.guide !== 'string' || !guidePattern.test(data.guide)) problems.push('guide must be a guide slug');
    if (data.skill !== undefined && (typeof data.skill !== 'string' || !kebabPattern.test(data.skill))) {
        problems.push('skill must be kebab-case');
    }
    if (
        !Array.isArray(data.checks) ||
        !data.checks.every((entry) => typeof entry === 'string' && checkPattern.test(entry))
    ) {
        problems.push('checks must be an array of id or id:target strings');
    }
    if (data.variables !== undefined) {
        if (!Array.isArray(data.variables)) {
            problems.push('variables must be an array');
        } else {
            for (const [index, variable] of data.variables.entries()) {
                problems.push(...variableProblems(variable, index));
            }
            const names = data.variables.map((variable) => variable?.name).filter((name) => typeof name === 'string');
            if (new Set(names).size !== names.length) problems.push('variable names must be unique');
        }
    }
    if (!Array.isArray(data.ops) || data.ops.length === 0) {
        problems.push('ops must be a non-empty array');
    } else {
        for (const [index, op] of data.ops.entries()) {
            problems.push(...opProblems(op, index));
        }
    }
    return problems;
}

function opProblems(op, index) {
    if (typeof op !== 'object' || op === null || Array.isArray(op)) return [`ops[${index}] must be an object`];
    if (op.op === 'addDependency') {
        const ok =
            Array.isArray(op.packages) &&
            op.packages.length > 0 &&
            op.packages.every((entry) => packagePattern.test(entry));
        return ok ? [] : [`ops[${index}].packages must name at least one @ndigo package`];
    }
    if (op.op === 'writeFile') {
        const ok = typeof op.template === 'string' && typeof op.path === 'string';
        return ok ? [] : [`ops[${index}] writeFile needs template and path strings`];
    }
    if (op.op === 'editJson') {
        const ok = typeof op.path === 'string' && typeof op.pointer === 'string' && op.pointer.startsWith('/');
        return ok ? [] : [`ops[${index}] editJson needs path and a JSON pointer`];
    }
    return [`ops[${index}].op "${String(op.op)}" is not supported`];
}

function variableProblems(variable, index) {
    if (typeof variable !== 'object' || variable === null || Array.isArray(variable)) {
        return [`variables[${index}] must be an object`];
    }
    const problems = [];
    for (const key of Object.keys(variable)) {
        if (key !== 'name' && key !== 'description' && key !== 'default') {
            problems.push(`variables[${index}].${key} is not a known key`);
        }
    }
    if (typeof variable.name !== 'string' || !/^[a-z][a-zA-Z0-9]*$/u.test(variable.name)) {
        problems.push(`variables[${index}].name must be camelCase`);
    }
    if (typeof variable.description !== 'string' || variable.description.length === 0) {
        problems.push(`variables[${index}].description must be a non-empty string`);
    }
    if (variable.default !== undefined && typeof variable.default !== 'string') {
        problems.push(`variables[${index}].default must be a string`);
    }
    return problems;
}

/**
 * Checks a template's placeholders against the capability's declared
 * variables. `appName` is built in; every other placeholder must be declared,
 * and every declared variable must be used.
 */
function templateProblems(capability, file, templatePath) {
    const text = readFileSync(file, 'utf8');
    const declared = new Set((capability.variables ?? []).map((variable) => variable.name));
    const used = new Set([...text.matchAll(/\{\{([a-z][a-zA-Z0-9]*)\}\}/gu)].map((match) => match[1]));
    const problems = [];
    for (const name of used) {
        if (name !== 'appName' && !declared.has(name)) {
            problems.push(
                `capability "${capability.id}" template "${templatePath}" uses undeclared variable "{{${name}}}"`
            );
        }
    }
    for (const name of declared) {
        if (!used.has(name)) {
            problems.push(`capability "${capability.id}" declares unused variable "${name}"`);
        }
    }
    return problems;
}

function isSafeRelativePath(path) {
    if (path === '' || path.startsWith('/') || path.includes('\\')) return false;
    return path.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}
