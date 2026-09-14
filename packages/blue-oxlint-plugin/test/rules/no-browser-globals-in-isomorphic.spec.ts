/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noBrowserGlobalsInIsomorphic } from '../../src/rules/no-browser-globals-in-isomorphic';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-browser-globals-in-isomorphic', noBrowserGlobalsInIsomorphic, {
    valid: [
        // Browser-only packages are exempt
        {
            code: 'window.location.reload();',
            filename: '/packages/blue-platform-web/src/feature.ts',
        },
        {
            code: 'document.getElementById("app");',
            filename: '/packages/blue-platform-web/src/dom.ts',
        },
        {
            code: 'navigator.onLine;',
            filename: '/packages/blue-platform-web/src/offline-detector.ts',
        },
        // Test files are exempt
        {
            code: 'window.location.href = "/test";',
            filename: '/packages/blue-core/test/something.spec.ts',
        },
        // typeof guards are allowed
        {
            code: `
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            `,
            filename: '/packages/blue-core/src/init.ts',
        },
        // Local binding shadows the global
        {
            code: `
                function process(data: any) {
                    const document = { createElement() {} };
                    document.createElement('div');
                }
            `,
            filename: '/packages/blue-core/src/processor.ts',
        },
        // Parameter with browser global name
        {
            code: `
                function getLocation(location: string) {
                    return location;
                }
            `,
            filename: '/packages/blue-core/src/util.ts',
        },
        // No browser globals used at all
        {
            code: 'const x = 42; export const y = x + 1;',
            filename: '/packages/blue-core/src/math.ts',
        },
    ],
    invalid: [
        // Direct window access in isomorphic package
        {
            code: 'window.location.reload();',
            filename: '/packages/blue-core/src/init.ts',
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
            filename: '/packages/blue-core/src/dom-util.ts',
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
            filename: '/packages/blue-core/src/responsive.ts',
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
            filename: '/packages/blue-view/src/view.ts',
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
            filename: '/packages/blue-router/src/matcher.ts',
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
            filename: '/packages/blue-core/src/storage.ts',
            errors: [
                {
                    messageId: 'browserGlobal',
                    data: { name: 'localStorage' },
                },
            ],
        },
    ],
});
