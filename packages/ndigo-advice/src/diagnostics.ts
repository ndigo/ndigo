/**
 * Startup diagnostics for declarations that no rule can serve.
 *
 * An annotation is inert by design — it declares a value and hands execution
 * to a rule. When a class declares annotations and nothing claims them, the
 * methods run unadvised and the omission is invisible until someone notices
 * missing traces. This diagnostic names it once per class, at weave time.
 */
import { getSymbolMetadata } from '@ndigo/core';

/**
 * Classes already reported. A class can be instantiated many times; the
 * diagnosis is a property of the declaration, not of any one instance.
 */
const REPORTED = new WeakSet<Function>();

/**
 * The member-scoped keys a class declares.
 *
 * Metadata keys use `<namespace>:<name>[:<member>]`. A two-segment key is a
 * class-level declaration; three or more segments name a member. Values that
 * are not strings are ignored — the grammar belongs to the declaring package,
 * and this scan must never throw on unusual keys.
 *
 * @param targetType - The declaring class.
 * @returns The member-scoped metadata keys.
 *
 * @example
 * ```ts
 * annotatedMembers();
 * ```
 */
export function annotatedMembers(targetType: Function): readonly string[] {
    const metadata = getSymbolMetadata(targetType);
    const keys: string[] = [];

    for (const key of Object.keys(metadata)) {
        const segments = key.split(':');
        if (segments.length >= 3 && segments.every((segment) => segment.length > 0)) {
            keys.push(key);
        }
    }

    return keys;
}

/**
 * Whether this class was already reported, marking it when it was not.
 *
 * @param targetType - The declaring class.
 * @returns `true` on the first call for a class, `false` afterwards.
 */
function claimReport(targetType: Function): boolean {
    if (REPORTED.has(targetType)) {
        return false;
    }
    REPORTED.add(targetType);
    return true;
}

/**
 * Builds the warning for a class whose annotated methods nothing advises, or
 * `undefined` when there is nothing to report.
 *
 * Returns `undefined` once the class has been reported, and when the class
 * declares no member annotations.
 *
 * @param targetType - The declaring class.
 * @param entryName - The container entry name, used to name the entry.
 * @returns The warning message, or `undefined`.
 *
 * @example
 * ```ts
 * const warning = unadvisedAnnotationWarning(OrderService, 'orders');
 * if (warning !== undefined) logger.warn(warning);
 * ```
 */
export function unadvisedAnnotationWarning(targetType: Function, entryName: string): string | undefined {
    const annotated = annotatedMembers(targetType);
    if (annotated.length === 0 || !claimReport(targetType)) {
        return undefined;
    }

    const members = [...new Set(annotated.map((key) => key.split(':').slice(2).join(':')))].sort();
    return (
        `entry '${entryName}' declares annotations on ${members.map((member) => `'${member}'`).join(', ')} ` +
        `but no registered rule advises them — those methods run unadvised. ` +
        `Register a rule for the annotation, or remove it.`
    );
}
