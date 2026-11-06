/**
 * File-writing helper for `@ndigo/openapi` (AD-96 / richer openapi output).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { writeFileSync } from 'node:fs';
import { OpenAPISpecGenerator } from './spec.js';
import type { RouteMappingTable } from './spec.js';
import type { OpenAPIGeneratorOptions } from './spec.js';

export type OpenAPIFormat = 'json' | 'yaml';

export interface WriteOpenAPISpecOptions {
    mappings: readonly RouteMappingTable[];
    generatorOptions?: OpenAPIGeneratorOptions;
    outPath: string;
    format?: OpenAPIFormat;
}

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
