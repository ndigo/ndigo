/**
 * Oxlint plugin that bundles Ndigo's consumer-facing lint rules.
 */
import { eslintCompatPlugin } from '@oxlint/plugins';

import { noBrowserGlobals } from './rules/no-browser-globals.js';
import { noDuplicateMapping } from './rules/no-duplicate-mapping.js';
import { noMixedDecoratorParadigms } from './rules/no-mixed-decorator-paradigms.js';
import { noRawConsole } from './rules/no-raw-console.js';
import { noScheduledInBrowser } from './rules/no-scheduled-in-browser.js';
import { noSignalsInEntity } from './rules/no-signals-in-entity.js';
import { noStringTokenLookup } from './rules/no-string-token-lookup.js';
import { noUnsafeViewNameLiteral } from './rules/no-unsafe-view-name-literal.js';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@ndigo/oxlint-plugin',
    },
    rules: {
        'no-browser-globals': noBrowserGlobals,
        'no-duplicate-mapping': noDuplicateMapping,
        'no-mixed-decorator-paradigms': noMixedDecoratorParadigms,
        'no-raw-console': noRawConsole,
        'no-scheduled-in-browser': noScheduledInBrowser,
        'no-signals-in-entity': noSignalsInEntity,
        'no-string-token-lookup': noStringTokenLookup,
        'no-unsafe-view-name-literal': noUnsafeViewNameLiteral,
    },
});

/**
 * The Ndigo oxlint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules.
 */
export default plugin;
