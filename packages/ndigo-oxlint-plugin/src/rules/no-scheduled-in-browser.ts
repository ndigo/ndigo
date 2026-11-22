/**
 * Rule that flags `@ndigo/scheduler` imports in files that also import
 * browser-platform packages.
 */
import type { Context, ESTree } from '@oxlint/plugins';

import { ruleUrl } from '../_docs.js';

const schedulerImportPattern = /^@ndigo\/scheduler(?:\/|$)/u;
const browserPlatformPattern = /^@ndigo\/(?:platform-web|view-webcomponent)(?:\/|$)/u;

/**
 * Reports `@ndigo/scheduler` usage alongside browser-platform imports.
 *
 * Scheduling is Node-only: `@scheduled` throws in
 * environments without `process`, so a file that imports the scheduler
 * where browser glue is also imported is a platform-misuse smell. The rule
 * is a heuristic — the runtime platform guard and the documentation carry
 * the rest of the enforcement.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'oxlint';
 *
 * export default defineConfig({
 *     plugins: ['@ndigo'],
 *     rules: { '@ndigo/no-scheduled-in-browser': 'error' },
 * });
 * ```
 */
export const noScheduledInBrowser = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow @ndigo/scheduler imports in browser-platform files',
            url: ruleUrl('no-scheduled-in-browser'),
            recommended: true,
        },
        messages: {
            scheduledInBrowser: `'@ndigo/scheduler' is Node-only — move @scheduled classes to a Node application; this file also imports browser-platform code. ${ruleUrl('no-scheduled-in-browser')}`,
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        let importsScheduler = false;
        const browserImports: ESTree.StringLiteral[] = [];

        return {
            before() {
                importsScheduler = false;
                browserImports.length = 0;
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                // Type-only imports are erased; neither side says anything
                // about the runtime platform of this file.
                if (node.importKind === 'type') {
                    return;
                }
                if (schedulerImportPattern.test(node.source.value)) {
                    importsScheduler = true;
                } else if (browserPlatformPattern.test(node.source.value)) {
                    browserImports.push(node.source);
                }
            },
            'Program:exit'() {
                if (!importsScheduler) {
                    return;
                }
                for (const source of browserImports) {
                    context.report({
                        node: source,
                        messageId: 'scheduledInBrowser',
                    });
                }
            },
        };
    },
};
