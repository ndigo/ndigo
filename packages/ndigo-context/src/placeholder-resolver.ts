/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, JSONValue } from '@ndigo/core';
import { PropertyResolver } from './property-resolver';

/** Maximum placeholder nesting depth (panic switch for runaway nesting, not the cycle guard). */
const MAX_DEPTH = 10;

/** A single `${...}` placeholder occurrence within a template. */
interface PlaceholderOccurrence {
    /** The start index of the `${` in the template. */
    start: number;
    /** The end index of the matching `}`. */
    end: number;
    /** The placeholder body (including inline default, e.g. `key:default`). */
    body: string;
}

/**
 * Scans a template string for `${...}` occurrences. The closing `}` is
 * depth-aware — a nested `${` inside a body increments depth, so
 * `${a:${b:fallback}}` yields one occurrence with body `a:${b:fallback}`.
 *
 * @param template - The string to scan.
 * @returns The occurrences found, in order.
 */
function scanPlaceholders(template: string): PlaceholderOccurrence[] {
    const occurrences: PlaceholderOccurrence[] = [];
    let index = 0;
    const length = template.length;
    while (index < length) {
        const start = template.indexOf('${', index);
        if (start === -1) break;
        let depth = 1;
        let cursor = start + 2;
        while (cursor < length && depth > 0) {
            const open = template.indexOf('${', cursor);
            const close = template.indexOf('}', cursor);
            if (close === -1) break; // unterminated: treat the rest as literal
            if (open !== -1 && open < close) {
                depth++;
                cursor = open + 2;
            } else {
                depth--;
                cursor = close + 1;
            }
        }
        if (depth > 0) break; // unterminated
        occurrences.push({ start, end: cursor - 1, body: template.slice(start + 2, cursor - 1) });
        index = cursor;
    }
    return occurrences;
}

/**
 * Resolves `${key}` and `${key:default}` placeholders against a property
 * resolver.
 *
 * Cycle guard: keys currently being resolved are tracked; re-entry throws an
 * `IllegalStateError` naming the cycle — a depth cap cannot catch cycles, it
 * only overflow-panics. `MAX_DEPTH` stays as a deliberate panic switch for
 * runaway non-cyclic nesting.
 *
 * Unresolvable placeholders (key missing AND no inline default) pass through
 * literally — the de-facto escape: a `${key}` matching no property survives
 * reads unchanged. Required reads detect the residual by their own callers.
 *
 * @param template - The string to resolve.
 * @param resolver - The property source to resolve against.
 * @param inProgress - Keys currently being resolved (cycle detection).
 * @param depth - Current nesting depth.
 * @returns The resolved string.
 * @throws {IllegalStateError} On a placeholder cycle or runaway nesting.
 */
export function resolvePlaceholders(
    template: string,
    resolver: PropertyResolver,
    inProgress: Set<string> = new Set(),
    depth = 0
): string {
    if (!template.includes('${')) return template;
    if (depth >= MAX_DEPTH) {
        throw new IllegalStateError(`Placeholder nesting exceeds the maximum depth of ${MAX_DEPTH}`);
    }

    let result = '';
    let cursor = 0;
    for (const occurrence of scanPlaceholders(template)) {
        result += template.slice(cursor, occurrence.start);

        const [rawKey, ...defaultParts] = occurrence.body.split(':');
        const key = rawKey.trim();
        const inlineDefault = defaultParts.join(':'); // default may itself contain ':'

        let resolved: JSONValue | undefined;
        if (key) {
            if (inProgress.has(key)) {
                throw new IllegalStateError(`Circular placeholder reference: ${[...inProgress, key].join(' → ')}`);
            }
            inProgress.add(key);
            try {
                const raw = resolver.getRawProperty(key);
                resolved =
                    typeof raw === 'string' && raw.includes('${')
                        ? resolvePlaceholders(raw, resolver, inProgress, depth + 1)
                        : raw;
            } finally {
                inProgress.delete(key);
            }
        }

        if (resolved === undefined) {
            // Inline default; it may itself contain placeholders (${a:${b:x}}).
            if (inlineDefault.includes('${')) {
                result += resolvePlaceholders(inlineDefault, resolver, inProgress, depth + 1);
            } else {
                result += inlineDefault !== '' ? inlineDefault : `\${${occurrence.body}}`; // passthrough
            }
        } else {
            result += String(resolved);
        }
        cursor = occurrence.end + 1;
    }

    result += template.slice(cursor);
    return result;
}
