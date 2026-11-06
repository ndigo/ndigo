/**
 * Internal read/validation of `ndigo update` version manifests (issue #144).
 * The manifest is a trust boundary: its values are copied into an app's
 * `package.json` right before `pnpm install`, so anything besides a strict
 * object of `@ndigo/<name> -> <exact semver pin>` pairs — npm alias specs
 * (`npm:@evil/pkg@1`), git/tarball/file specs, dist-tags, or range
 * specifiers — is rejected before a byte reaches the disk.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { existsSync, readFileSync } from 'node:fs';

/** One `ndigo update` manifest: the pinned version of each `@ndigo/*` package. */
export interface VersionManifest {
    packages: Record<string, string>;
}

/**
 * What reading a manifest path produced: a validated manifest, an absent
 * file, or a file whose contents fail the shape/value contract.
 */
export type ManifestLookup =
    | { kind: 'absent'; path: string }
    | { kind: 'invalid'; path: string; reason: string }
    | { kind: 'valid'; path: string; manifest: VersionManifest };

const ndigoPackagePattern = /^@ndigo\/[a-z0-9][a-z0-9-]*$/u;
// Exact pins only (issue #144): values land in package.json dependencies and
// are handed to `pnpm install` unvalidated besides this check — a `npm:`/
// `github:`/`https:`/`file:` alias would install an arbitrary package, a
// dist-tag is a moving target, and range specifiers make the literal
// `--check` comparison meaningless. `^`/`~` live in the app, never here.
const exactPinPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;

/**
 * Whether `value` is a structurally valid version manifest: an object with a
 * `packages` record whose keys are `@ndigo/*` names and whose values are
 * exact semver pin strings. A duck-typing check (STYLE_GUIDE `like*`).
 *
 * @param value - The parsed JSON document.
 * @returns True when every manifest entry satisfies the contract.
 */
export function likeVersionManifest(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const record = value as Record<PropertyKey, unknown>;
    const packages = record['packages'];
    if (typeof packages !== 'object' || packages === null || Array.isArray(packages)) {
        return false;
    }
    for (const [name, spec] of Object.entries(packages as Record<PropertyKey, unknown>)) {
        if (!ndigoPackagePattern.test(name)) {
            return false;
        }
        if (typeof spec !== 'string' || !exactPinPattern.test(spec)) {
            return false;
        }
    }
    return true;
}

/**
 * Reads and validates a version manifest. Both a missing file and a broken
 * file are reported as a result kind instead of thrown — the command turns
 * them into usage errors, never stack traces.
 *
 * @param path - The manifest path (flag, env, or the app-local default).
 * @returns The lookup outcome for the three states the command must handle.
 */
export function readVersionManifest(path: string): ManifestLookup {
    if (!existsSync(path)) {
        return { kind: 'absent', path };
    }
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    } catch {
        return { kind: 'invalid', path, reason: 'not valid JSON' };
    }
    if (likeVersionManifest(raw)) {
        return { kind: 'valid', path, manifest: raw as VersionManifest };
    }
    return { kind: 'invalid', path, reason: describeMismatch(raw) };
}

/**
 * Produces a user-facing reason for why `raw` failed {@link likeVersionManifest}.
 * Names the first offending entry when it can, so `ndigo update` messages
 * point at the spec string rather than collapsing into 'invalid'.
 */
function describeMismatch(raw: unknown): string {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return 'the manifest is not a JSON object';
    }
    const record = raw as Record<PropertyKey, unknown>;
    const packages = record['packages'];
    if (typeof packages !== 'object' || packages === null || Array.isArray(packages)) {
        return "'packages' must be an object of @ndigo/* names -> exact version pins";
    }
    for (const [name, spec] of Object.entries(packages as Record<PropertyKey, unknown>)) {
        if (!ndigoPackagePattern.test(name)) {
            return `'${name}' is not an @ndigo/* package name`;
        }
        if (typeof spec !== 'string') {
            return `'${name}' has a non-string version`;
        }
        if (!exactPinPattern.test(spec)) {
            return `'${name}' is not an exact version pin (expected e.g. '1.2.3'; ranges, dist-tags, and npm:/github:/https:/file: specs are rejected)`;
        }
    }
    return 'the manifest shape does not match { packages: Record<@ndigo/*, version pin> }';
}
