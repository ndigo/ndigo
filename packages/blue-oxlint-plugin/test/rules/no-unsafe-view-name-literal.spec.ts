/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noUnsafeViewNameLiteral } from '../../src/rules/no-unsafe-view-name-literal';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-unsafe-view-name-literal', noUnsafeViewNameLiteral, {
    valid: [
        // Plain relative view names
        {
            code: `new IslandView('todo-app')`,
            filename: '/packages/blue-app/src/views.ts',
        },
        {
            code: `new ModelAndView('home', { items: [] })`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `resolver.resolveViewName('dashboard')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `resolveViewName('account')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Dots inside a segment are valid (not a `..` segment)
        {
            code: `new ModelAndView('v1.2')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `resolver.resolveViewName('my.file')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Nested names are a supported, documented spelling (isSafeViewName allows separators)
        {
            code: `new ModelAndView('admin/user')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `resolver.resolveViewName('admin/users')`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Dynamic expressions are not inspected
        {
            code: `new ModelAndView(viewName)`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `resolver.resolveViewName(\`\${prefix}/home\`)`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // ModelAndView instance form is not a literal
        {
            code: `new ModelAndView(new IslandView('todo-app'))`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // EJSView takes a template path, not a view name — separators are expected
        {
            code: `new EJSView('pages/home.html', { loader })`,
            filename: '/packages/blue-app/src/views.ts',
        },
        // Unrelated calls with the same first argument
        {
            code: `other('..')`,
            filename: '/packages/blue-app/src/views.ts',
        },
    ],
    invalid: [
        // `..` segment
        {
            code: `new ModelAndView('../secret')`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
        {
            code: `new ModelAndView('..')`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // Matrix-parameter spelling of a `..` segment
        {
            code: `new ModelAndView('..;x=1')`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // Absolute marker
        {
            code: `resolver.resolveViewName('/etc/passwd')`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
        {
            code: `resolveViewName('C:\\\\windows')`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // NUL byte
        {
            code: `new IslandView('home\\u0000.png')`,
            filename: '/packages/blue-app/src/views.ts',
            errors: [{ messageId: 'unsafeViewName' }],
        },
    ],
});
