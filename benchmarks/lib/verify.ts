/**
 * Shared verification helpers for the benchmark lane.
 */

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((item, index) => deepEqual(item, b[index]));
    }
    if (isObject(a) && isObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
    }
    return false;
}

export function assertEquivalent(label: string, actual: unknown, expected: unknown): void {
    if (!deepEqual(actual, expected)) {
        throw new Error(
            `assertEquivalent failed: ${label}\n  actual:   ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`
        );
    }
}

export function benchName(name: string, ops: number = 1): string {
    return ops > 1 ? `${name} @ops=${ops}` : name;
}

let sinkValue: unknown;

export function sink(value?: unknown): void {
    sinkValue = value;
}

export const retain = sink;
export { sinkValue };