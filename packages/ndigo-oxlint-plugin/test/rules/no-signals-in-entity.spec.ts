/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noSignalsInEntity } from '../../src/rules/no-signals-in-entity';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-signals-in-entity', noSignalsInEntity, {
    valid: [
        // Entity file without signals import
        {
            code: `import { entity, column, primaryColumn } from '@ndigo/orm';
                    @entity('users')
                    class User {
                        @primaryColumn() id!: number;
                        @column() name!: string;
                    }`,
            filename: '/packages/ndigo-app/src/entities/user.ts',
        },
        // Signals import in a non-entity file (component/service)
        {
            code: `import { signal } from '@ndigo/signals';
                    export const count = signal(0);`,
            filename: '/packages/ndigo-app/src/state.ts',
        },
        // Entity file with signals import but no @entity declaration
        {
            code: `import { signal } from '@ndigo/signals';
                    class Plain { }
                    export const n = signal(1);`,
            filename: '/packages/ndigo-app/src/events.ts',
        },
    ],
    invalid: [
        {
            code: `import { entity, column } from '@ndigo/orm';
                    import { signal } from '@ndigo/signals';
                    @entity('users')
                    class User {
                        @column() name!: string;
                        reactive = signal('');
                    }`,
            filename: '/packages/ndigo-app/src/entities/user.ts',
            errors: [{ messageId: 'signalsInEntity' }],
        },
    ],
});
