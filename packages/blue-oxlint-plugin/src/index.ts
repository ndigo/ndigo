/**
 * Oxlint plugin that bundles BlueJS's consumer-facing lint rules.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { eslintCompatPlugin } from '@oxlint/plugins';

import { noBrowserGlobalsInIsomorphic } from './rules/no-browser-globals-in-isomorphic.js';
import { noCrossParadigmDecorators } from './rules/no-cross-paradigm-decorators.js';
import { noScheduledInBrowser } from './rules/no-scheduled-in-browser.js';
import { noSignalsInEntity } from './rules/no-signals-in-entity.js';
import { noStringRegistryLookup } from './rules/no-string-registry-lookup.js';
import { noUnsafeViewNameLiteral } from './rules/no-unsafe-view-name-literal.js';
import { noDuplicateMappingPath } from './rules/no-duplicate-mapping-path.js';
import { noRawConsole } from './rules/no-raw-console.js';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@blue/oxlint-plugin',
    },
    rules: {
        'no-browser-globals-in-isomorphic': noBrowserGlobalsInIsomorphic,
        'no-cross-paradigm-decorators': noCrossParadigmDecorators,
        'no-scheduled-in-browser': noScheduledInBrowser,
        'no-signals-in-entity': noSignalsInEntity,
        'no-string-registry-lookup': noStringRegistryLookup,
        'no-unsafe-view-name-literal': noUnsafeViewNameLiteral,
        'no-duplicate-mapping-path': noDuplicateMappingPath,
        'no-raw-console': noRawConsole,
    },
});

/**
 * The BlueJS oxlint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules.
 */
export default plugin;
