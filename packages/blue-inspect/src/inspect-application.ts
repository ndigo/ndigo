/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 *
 * `inspectApplication` — build a deterministic, versioned JSON manifest for a
 * running application: its identity, routes, handler mappings and declared
 * configuration keys (never values).
 */

import type { ApplicationContext } from '@blue/context';
import { collectConfig } from './config';
import { collectMappings } from './mappings';
import { collectRoutes } from './routes';
import type { InspectApp, InspectInput, InspectManifest } from './types';

/**
 * The application identity block: context name (when set) and active profiles.
 */
function buildApp(context: ApplicationContext): InspectApp {
    const profiles = [...(context.environment?.activeProfiles ?? [])];
    const app: InspectApp = { profiles };
    if (typeof context.name === 'string' && context.name.length > 0) app.name = context.name;
    return app;
}

/**
 * Build a deterministic, versioned manifest from an application context.
 *
 * Every collection is sorted and de-duplicated, so two runs over the same
 * application produce identical output apart from `generatedAt` (pin it with
 * `input.now` for byte-identical results). Configuration values are never
 * read — only key presence and origin — so secrets cannot leak.
 *
 * @param input - The context plus optional route/mapping/config sources.
 * @returns The application manifest.
 */
export function inspectApplication(input: InspectInput): InspectManifest {
    const { context } = input;
    return {
        version: 1,
        generatedAt: input.now ?? new Date().toISOString(),
        app: buildApp(context),
        routes: collectRoutes(input.routes),
        mappings: collectMappings(input.mappings),
        config: collectConfig(input.configurationClasses ?? [], context.environment),
    };
}
