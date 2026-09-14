/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import { IllegalStateError, JSONValue } from '@blue/core';
import type { PropertyResolver } from './property-resolver';

const ENV_SCHEMA = 'boot:environmentSchema';

/**
 * Reads the schema metadata from a class constructor.
 */
function getMetadata(target: unknown): Record<string, unknown> {
    return (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
}

/**
 * Marks a configuration class with the zod schema of its resolved
 * environment — the schema IS the contract (AD-17).
 *
 * The schema validates the environment's resolved values (via
 * `validateEnvironment`); boot fails loudly with the aggregate report when
 * invalid. No coercion: validation only reports.
 *
 * @param schema - The zod schema of the environment's shape.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { environment } from '@blue/context';
 *
 * @environment(z.object({ server: z.object({ port: z.coerce.number().min(1) }) }))
 * class AppConfig {}
 * ```
 */
export function environment(schema: z.ZodType) {
    return function <T extends new (...args: never[]) => unknown>(target: T, context: ClassDecoratorContext): T {
        context.metadata[ENV_SCHEMA] = schema;
        return target;
    };
}

/**
 * Returns the schema declared on a class via `@environment`, if any.
 *
 * @param target - The class (or instance constructor).
 * @returns The declared schema, or `undefined`.
 */
export function getEnvironmentSchema(target: unknown): z.ZodType | undefined {
    return getMetadata(target)[ENV_SCHEMA] as z.ZodType | undefined;
}

/**
 * A single validation issue: the property path that failed, what was
 * expected, and what the environment actually held.
 */
export interface EnvironmentIssue {
    /** The property keypath that failed (e.g. `server.port`). */
    path: string;
    /** Human-readable expectation from the schema. */
    expected: string;
    /** The actual resolved value (raw). */
    actual: JSONValue | undefined;
}

/**
 * The structured result of validating an environment against a schema.
 */
export interface ValidationResult {
    /** Whether every resolved value satisfied the schema. */
    valid: boolean;
    /** All issues found (aggregate — validation reports everything at once). */
    issues: EnvironmentIssue[];
}

/**
 * Flattens a zod issue path array (`['server', 'port']`) into a keypath.
 */
const pathOf = (issue: { path: readonly (string | number | symbol)[] }): string => issue.path.map(String).join('.');

/**
 * Validates the resolved values of a property resolver against a zod schema.
 *
 * Aggregate (AD-17 Q1): every violation is reported — validation's point is
 * the full report. Report-only (Q2): zod transforms/defaults are never
 * written back — the environment is the source of truth; conversion is P4's
 * binding.
 *
 * @param resolver - The property resolver (or environment) to validate.
 * @param schema - The zod schema of the expected shape.
 * @returns The aggregate validation result.
 *
 * @example
 * ```ts
 * const { valid, issues } = validateEnvironment(environment, schema);
 * ```
 */
export function validateEnvironment(
    resolver: Pick<PropertyResolver, 'getProperty'>,
    schema: z.ZodType
): ValidationResult {
    // The environment's shape is a bundle of top-level keys — validate it as
    // a whole. Non-object schemas have no top-level probe points (fail-loud;
    // the contract is "schema of the environment's shape").
    if (typeof schema !== 'object' || schema === null || typeof (schema as { shape?: unknown }).shape !== 'object') {
        throw new IllegalStateError("validateEnvironment requires a zod object schema (the environment's shape)");
    }

    const issues: EnvironmentIssue[] = [];
    // Type-narrow: an object schema carries `.shape`; the environment's shape
    // is its top-level keys (zod's ZodObject, structurally verified above).
    const candidateShape = (schema as z.ZodObject<Record<string, z.ZodType>>).shape;
    const candidate: Record<string, JSONValue | undefined> = {};
    for (const key of Object.keys(candidateShape)) {
        candidate[key] = resolver.getProperty(key);
    }

    const result = schema.safeParse(candidate);
    if (result.success) {
        return { valid: true, issues };
    }

    for (const issue of result.error.issues) {
        // Walk the issue path down the candidate to report the value AT the
        // failing path (scalar or subtree); symbol segments can't index JSON.
        let cursor: unknown = candidate;
        for (const segment of issue.path) {
            if (typeof segment === 'symbol') {
                cursor = undefined;
                break;
            }
            if (cursor === null || typeof cursor !== 'object') {
                cursor = undefined;
                break;
            }
            cursor = (cursor as Record<string | number, unknown>)[segment];
        }
        issues.push({
            path: pathOf(issue),
            expected: issue.message,
            actual: cursor as JSONValue | undefined,
        });
    }
    return { valid: false, issues };
}
