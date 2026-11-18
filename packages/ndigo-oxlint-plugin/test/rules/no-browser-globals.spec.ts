/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noBrowserGlobals } from '../../src/rules/no-browser-globals';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-browser-globals', noBrowserGlobals, {
    valid: [
        // typeof guards are allowed
        {
            code: `
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            `,
            filename: '/app/src/init.ts',
        },
        // Negated guard inside a logical expression
        {
            code: `
                const width = typeof window !== 'undefined' && window.innerWidth;
                export { width };
            `,
            filename: '/app/src/width.ts',
        },
        // Conditional-expression guard
        {
            code: `const target = typeof document !== 'undefined' ? document.body : null;`,
            filename: '/app/src/target.ts',
        },
        // Local binding shadows the global
        {
            code: `
                function process(data: any) {
                    const document = { createElement() {} };
                    document.createElement('div');
                }
            `,
            filename: '/app/src/processor.ts',
        },
        // Parameter with a browser-global name
        {
            code: `
                function getLocation(location: string) {
                    return location;
                }
            `,
            filename: '/app/src/util.ts',
        },
        // No browser globals used at all
        {
            code: 'const x = 42; export const y = x + 1;',
            filename: '/app/src/math.ts',
        },
        // A class method named like a browser global is a name position
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
            filename: '/app/src/queue.ts',
        },
        // Object-literal keys and member properties are name positions
        {
            code: `
                const names = { window: 1, history: 2, location: 3 };
                const value = names.history;
                export { value };
            `,
            filename: '/app/src/names.ts',
        },
        // A global not in the default list stays legal unless configured
        {
            code: `matchMedia('(prefers-color-scheme: dark)');`,
            filename: '/app/src/theme.ts',
        },
        // A name outside extraGlobals is not checked
        {
            code: `matchMedia('(prefers-color-scheme: dark)');`,
            filename: '/app/src/theme.ts',
            options: [{ extraGlobals: ['ResizeObserver'] }],
        },
    ],
    invalid: [
        // Direct window access
        {
            code: 'window.location.reload();',
            filename: '/app/src/init.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'window' } }],
        },
        // Direct document access
        {
            code: 'const el = document.getElementById("app");',
            filename: '/app/src/dom-util.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'document' } }],
        },
        // Multiple browser globals
        {
            code: `
                if (window.innerWidth > 768) {
                    navigator.serviceWorker.register('/sw.js');
                }
            `,
            filename: '/app/src/responsive.ts',
            errors: [
                { messageId: 'browserGlobal', data: { name: 'window' } },
                { messageId: 'browserGlobal', data: { name: 'navigator' } },
            ],
        },
        // history.pushState
        {
            code: 'history.pushState(null, "", "/new-path");',
            filename: '/app/src/view.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'history' } }],
        },
        // location (not shadowed)
        {
            code: 'const current = location.href;',
            filename: '/app/src/matcher.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'location' } }],
        },
        // localStorage access
        {
            code: 'localStorage.setItem("key", "value");',
            filename: '/app/src/storage.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'localStorage' } }],
        },
        // A configured global is reported alongside the defaults
        {
            code: `new ResizeObserver(() => {});`,
            filename: '/app/src/observer.ts',
            options: [{ extraGlobals: ['ResizeObserver'] }],
            errors: [{ messageId: 'browserGlobal', data: { name: 'ResizeObserver' } }],
        },
        // A guard for one global does not protect another
        {
            code: `
                if (typeof window !== 'undefined') {
                    document.title = 'ready';
                }
            `,
            filename: '/app/src/title.ts',
            errors: [{ messageId: 'browserGlobal', data: { name: 'document' } }],
        },
    ],
});
