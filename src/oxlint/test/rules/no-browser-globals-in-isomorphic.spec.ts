/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noBrowserGlobalsInIsomorphic } from '../../rules/no-browser-globals-in-isomorphic.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-browser-globals-in-isomorphic', noBrowserGlobalsInIsomorphic, {
    valid: [
        // Browser-only packages are exempt
        {
            code: 'window.location.reload();',
            filename: '/packages/ndigo-platform-web/src/feature.ts',
        },
        {
            code: 'document.getElementById("app");',
            filename: '/packages/ndigo-platform-web/src/dom.ts',
        },
        {
            code: 'navigator.onLine;',
            filename: '/packages/ndigo-platform-web/src/offline-detector.ts',
        },
        // Test files are exempt
        {
            code: 'window.location.href = "/test";',
            filename: '/packages/ndigo-core/test/something.spec.ts',
        },
        // typeof guards are allowed
        {
            code: `
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            `,
            filename: '/packages/ndigo-core/src/init.ts',
        },
        // Local binding shadows the global
        {
            code: `
                function process(data: any) {
                    const document = { createElement() {} };
                    document.createElement('div');
                }
            `,
            filename: '/packages/ndigo-core/src/processor.ts',
        },
        // Parameter with browser global name
        {
            code: `
                function getLocation(location: string) {
                    return location;
                }
            `,
            filename: '/packages/ndigo-core/src/util.ts',
        },
        // No browser globals used at all
        {
            code: 'const x = 42; export const y = x + 1;',
            filename: '/packages/ndigo-core/src/math.ts',
        },
        // A class method named like a browser global is a name position, not a reference
        {
            code: `
                export class Queue {
                    async history(destination: string) {
                        return destination;
                    }
                    get window() {
                        return 1;
                    }
                }
            `,
            filename: '/packages/ndigo-core/src/queue.ts',
        },
        // Object-literal keys (and member properties) named like browser globals
        {
            code: `
                const names = { window: 1, history: 2, location: 3 };
                const value = names.history;
                export { value };
            `,
            filename: '/packages/ndigo-core/src/names.ts',
        },
    ],
    invalid: [
        // Direct window access in isomorphic package
        {
            code: 'window.location.reload();',
            filename: '/packages/ndigo-core/src/init.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'window' },
                },
            ],
        },
        // Direct document access in isomorphic package
        {
            code: 'const el = document.getElementById("app");',
            filename: '/packages/ndigo-core/src/dom-util.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'document' },
                },
            ],
        },
        // Multiple browser globals
        {
            code: `
                if (window.innerWidth > 768) {
                    navigator.serviceWorker.register('/sw.js');
                }
            `,
            filename: '/packages/ndigo-core/src/responsive.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'window' },
                },
                {
                    messageId: 'browserGlobal',
                    data: { name: 'navigator' },
                },
            ],
        },
        // history.pushState in isomorphic package
        {
            code: 'history.pushState(null, "", "/new-path");',
            filename: '/packages/ndigo-view/src/view.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'history' },
                },
            ],
        },
        // location (not shadowed) in isomorphic package
        {
            code: 'const current = location.href;',
            filename: '/packages/ndigo-router/src/matcher.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'location' },
                },
            ],
        },
        // localStorage access
        {
            code: 'localStorage.setItem("key", "value");',
            filename: '/packages/ndigo-core/src/storage.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'localStorage' },
                },
            ],
        },
    ],
});
