/**
 * File-writing helper for `@ndigo/openapi` (AD-96 / richer openapi output).
 */
import { writeFileSync } from 'node:fs';
import { OpenAPISpecGenerator } from './spec.js';
import type { RouteMappingTable } from './spec.js';
import type { OpenAPIGeneratorOptions } from './spec.js';

/** Output serialization format. */
export type OpenAPIFormat = 'json' | 'yaml';

/** Options for {@link writeOpenAPISpec}. */
export interface WriteOpenAPISpecOptions {
    /** Route tables to merge into the document. */
    mappings: readonly RouteMappingTable[];
    /** Generator options (security, server url, etc.). */
    generatorOptions?: OpenAPIGeneratorOptions;
    /** Destination file path. */
    outPath: string;
    /** Serialization format; `'yaml'` currently falls back to JSON. */
    format?: OpenAPIFormat;
}

/**
 * Generates an OpenAPI document from route tables and writes it to disk.
 *
 * @param options - Route tables, generator options, and output destination.
 * @returns Nothing; the document is written to `outPath`.
 *
 * @example
 * ```ts
 * writeOpenAPISpec({ mappings: [mapping], outPath: 'openapi.json' });
 * ```
 */
export function writeOpenAPISpec(options: WriteOpenAPISpecOptions): void {
    const generator = new OpenAPISpecGenerator();
    const doc = generator.generate(options.mappings, options.generatorOptions ?? {});
    const format = options.format ?? 'json';
    if (format === 'json') {
        writeFileSync(options.outPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
        return;
    }
    // Minimal YAML: fall back to JSON for now (a real YAML serializer can be
    // plugged in later without changing this signature).
    writeFileSync(options.outPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
}
