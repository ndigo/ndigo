/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noSignalsInEntity } from '../../src/rules/no-signals-in-entity';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-signals-in-entity', noSignalsInEntity, {
    valid: [
        // Entity file without signals import
        {
            code: `import { entity, column, primaryColumn } from '@blue/orm';
                    @entity('users')
                    class User {
                        @primaryColumn() id!: number;
                        @column() name!: string;
                    }`,
            filename: '/packages/blue-app/src/entities/user.ts',
        },
        // Signals import in a non-entity file (component/service)
        {
            code: `import { signal } from '@blue/signals';
                    export const count = signal(0);`,
            filename: '/packages/blue-app/src/state.ts',
        },
        // Entity file with signals import but no @entity declaration
        {
            code: `import { signal } from '@blue/signals';
                    class Plain { }
                    export const n = signal(1);`,
            filename: '/packages/blue-app/src/events.ts',
        },
    ],
    invalid: [
        {
            code: `import { entity, column } from '@blue/orm';
                    import { signal } from '@blue/signals';
                    @entity('users')
                    class User {
                        @column() name!: string;
                        reactive = signal('');
                    }`,
            filename: '/packages/blue-app/src/entities/user.ts',
            errors: [{ messageId: 'signalsInEntity' }],
        },
    ],
});
