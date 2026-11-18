/**
 * Oxlint plugin that bundles Ndigo's consumer-facing lint rules.
 */
import { eslintCompatPlugin } from '@oxlint/plugins';

import { noMixedDecoratorParadigms } from './rules/no-mixed-decorator-paradigms.js';
import { noScheduledInBrowser } from './rules/no-scheduled-in-browser.js';
import { noSignalsInEntity } from './rules/no-signals-in-entity.js';
import { noStringTokenLookup } from './rules/no-string-token-lookup.js';
import { noUnsafeViewNameLiteral } from './rules/no-unsafe-view-name-literal.js';
import { noDuplicateMapping } from './rules/no-duplicate-mapping.js';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@ndigo/oxlint-plugin',
    },
    rules: {
        'no-mixed-decorator-paradigms': noMixedDecoratorParadigms,
        'no-scheduled-in-browser': noScheduledInBrowser,
        'no-signals-in-entity': noSignalsInEntity,
        'no-string-token-lookup': noStringTokenLookup,
        'no-unsafe-view-name-literal': noUnsafeViewNameLiteral,
        'no-duplicate-mapping': noDuplicateMapping,
    },
});

/**
 * The Ndigo oxlint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules.
 */
export default plugin;
