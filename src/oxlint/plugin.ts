/**
 * Internal oxlint plugin that registers the repository-only rules.
 *
 * Loaded directly as TypeScript by oxlint's JS-plugin runtime (Node ≥24 type
 * stripping) — there is no build step, so relative imports carry explicit
 * `.ts` extensions. Consumer-facing rules ship in `@ndigo/oxlint-plugin`
 * instead; this tree never leaves the repository (AD-86).
 *
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
import { eslintCompatPlugin } from '@oxlint/plugins';

import { noAbstractClassWithoutPrefix } from './rules/no-abstract-class-without-prefix.ts';
import { noDirectIntegrationImports } from './rules/no-direct-integration-imports.ts';
import { noGlobalStateInCreateFactories } from './rules/no-global-state-in-create-factories.ts';
import { noInternalFileExports } from './rules/no-internal-file-exports.ts';
import { noInternalFileImports } from './rules/no-internal-file-imports.ts';
import { noMixedCaseAcronyms } from './rules/no-mixed-case-acronyms.ts';
import { noUppercaseRegexpConstants } from './rules/no-uppercase-regexp-constants.ts';
import { noUpwardLayerImports } from './rules/no-upward-layer-imports.ts';
import { requiresDocHeader } from './rules/requires-doc-header.ts';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@ndigo/oxlint-internal',
    },
    rules: {
        'no-abstract-class-without-prefix': noAbstractClassWithoutPrefix,
        'no-direct-integration-imports': noDirectIntegrationImports,
        'no-global-state-in-create-factories': noGlobalStateInCreateFactories,
        'no-internal-file-exports': noInternalFileExports,
        'no-internal-file-imports': noInternalFileImports,
        'no-mixed-case-acronyms': noMixedCaseAcronyms,
        'no-uppercase-regexp-constants': noUppercaseRegexpConstants,
        'no-upward-layer-imports': noUpwardLayerImports,
        'requires-doc-header': requiresDocHeader,
    },
});

/**
 * The internal (repo-only) oxlint plugin entry point.
 */
export default plugin;
