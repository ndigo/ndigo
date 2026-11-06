/**
 * Oxlint plugin that bundles Ndigo's consumer-facing lint rules.
 */
import { eslintCompatPlugin } from '@oxlint/plugins';

import { noCrossParadigmDecorators } from './rules/no-cross-paradigm-decorators.js';
import { noScheduledInBrowser } from './rules/no-scheduled-in-browser.js';
import { noSignalsInEntity } from './rules/no-signals-in-entity.js';
import { noStringRegistryLookup } from './rules/no-string-registry-lookup.js';
import { noUnsafeViewNameLiteral } from './rules/no-unsafe-view-name-literal.js';
import { noDuplicateMappingPath } from './rules/no-duplicate-mapping-path.js';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@ndigo/oxlint-plugin',
    },
    rules: {
        'no-cross-paradigm-decorators': noCrossParadigmDecorators,
        'no-scheduled-in-browser': noScheduledInBrowser,
        'no-signals-in-entity': noSignalsInEntity,
        'no-string-registry-lookup': noStringRegistryLookup,
        'no-unsafe-view-name-literal': noUnsafeViewNameLiteral,
        'no-duplicate-mapping-path': noDuplicateMappingPath,
    },
});

/**
 * The Ndigo oxlint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules.
 */
export default plugin;
