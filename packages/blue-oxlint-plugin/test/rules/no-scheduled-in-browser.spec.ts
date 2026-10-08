/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noScheduledInBrowser } from '../../src/rules/no-scheduled-in-browser';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-scheduled-in-browser', noScheduledInBrowser, {
    valid: [
        // Scheduler import alone (server-side Node file).
        {
            code: `import { scheduled } from '@blue/scheduler';
                    class Maintenance {
                        @scheduled('* * * * * *')
                        tick() {}
                    }`,
            filename: '/packages/blue-api/src/maintenance.ts',
        },
        // Browser-platform import alone.
        {
            code: `import { changeLocale } from '@blue/platform-web';
                    changeLocale('fr');`,
            filename: '/packages/blue-todo/src/locale.ts',
        },
        // Neither import.
        {
            code: `import { getMapping } from '@blue/dispatcher';
                    class Home {}
                    export { Home };`,
            filename: '/packages/blue-api/src/controllers.ts',
        },
    ],
    invalid: [
        {
            code: `import { scheduled } from '@blue/scheduler';
                    import { changeLocale } from '@blue/platform-web';
                    class Demo {
                        @scheduled('* * * * * *')
                        tick() {}
                    }`,
            filename: '/packages/blue-todo/src/client-demo.ts',
            errors: [
                {
                    messageId: 'scheduledInBrowser',
                },
            ],
        },
        {
            code: `import { scheduled } from '@blue/scheduler';
                    import { AbstractWebComponent } from '@blue/view-webcomponent';
                    class Demo extends AbstractWebComponent {}
                    export { Demo };`,
            filename: '/packages/blue-todo/src/demo-view.ts',
            errors: [
                {
                    messageId: 'scheduledInBrowser',
                },
            ],
        },
    ],
});
