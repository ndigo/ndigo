/**
 * Rule that flags `@ndigo/scheduler` imports in files that also import
 * browser-platform packages.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

const schedulerImportPattern = /^@ndigo\/scheduler(?:\/|$)/u;
const browserPlatformPattern = /^@ndigo\/(?:platform-web|view-webcomponent)(?:\/|$)/u;

/**
 * Reports `@ndigo/scheduler` usage alongside browser-platform imports.
 *
 * Scheduling is Node-only (AD-20 D5.3): `@scheduled` throws in
 * environments without `process`, so a file that imports the scheduler
 * where browser glue is also imported is a platform-misuse smell. The rule
 * is a heuristic — the runtime platform guard and the documentation carry
 * the rest of the enforcement.
 */
export const noScheduledInBrowser = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow @ndigo/scheduler imports in browser-platform files',
        },
        messages: {
            scheduledInBrowser:
                "Do not import '@ndigo/scheduler' in a browser-platform file — scheduled tasks run on the server only (@scheduled throws without a Node runtime; AD-20 D5). Move @scheduled classes to a Node application.",
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
