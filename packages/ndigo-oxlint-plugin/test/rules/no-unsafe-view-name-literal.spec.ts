/**
 * @module ndigo-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { isSafeViewName, isValidCustomElementName } from '@ndigo/view';
import { noUnsafeViewNameLiteral } from '../../src/rules/no-unsafe-view-name-literal';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

const FILENAME = '/packages/ndigo-app/src/controllers.ts';

/**
 * Shared view-name vector table for the rule⇄runtime predicate parity check.
 *
 * The rule must report `ModelAndView`/`resolveViewName` literals exactly when
 * the runtime `isSafeViewName` returns `false` (DSV-SEC-1), and `IslandView`
 * literals exactly when `isValidCustomElementName` returns `false`. Both are
 * driven through RuleTester rather than by exporting the rule internals.
 */
const VIEW_NAME_VECTORS = ['\0', '/x', '\\x', 'C:/x', 'C:x', '..', '..;a=1', '.. ', 'v1.2', 'admin/user'] as const;
const CUSTOM_ELEMENT_VECTORS = [
    'todo-app',
    'x-y',
    'a.b-c',
    'x-',
    'MyElement',
    'plain',
    '-x-y',
    'x',
    'admin/user',
    'font-face',
] as const;

const viewParityValid: RuleTester.ValidTestCase[] = [];
const viewParityInvalid: RuleTester.InvalidTestCase[] = [];
for (const name of VIEW_NAME_VECTORS) {
    const code = `new ModelAndView(${JSON.stringify(name)})`;
    if (isSafeViewName(name)) {
        viewParityValid.push({ code, filename: FILENAME });
    } else {
        viewParityInvalid.push({ code, filename: FILENAME, errors: [{ messageId: 'unsafeViewName' }] });
    }
}

const islandParityValid: RuleTester.ValidTestCase[] = [];
const islandParityInvalid: RuleTester.InvalidTestCase[] = [];
for (const name of CUSTOM_ELEMENT_VECTORS) {
    const code = `new IslandView(${JSON.stringify(name)})`;
    if (isValidCustomElementName(name)) {
        islandParityValid.push({ code, filename: '/packages/ndigo-app/src/views.ts' });
    } else {
        islandParityInvalid.push({
            code,
            filename: '/packages/ndigo-app/src/views.ts',
            errors: [{ messageId: 'invalidIslandViewName' }],
        });
    }
}

ruleTester.run('no-unsafe-view-name-literal', noUnsafeViewNameLiteral, {
    valid: [
        // Plain relative view names
        {
            code: `new IslandView('todo-app')`,
            filename: '/packages/ndigo-app/src/views.ts',
        },
        {
            code: `new ModelAndView('home', { items: [] })`,
            filename: FILENAME,
        },
        {
            code: `resolver.resolveViewName('dashboard')`,
            filename: FILENAME,
        },
        {
            code: `resolveViewName('account')`,
            filename: FILENAME,
        },
        // Dots inside a segment are valid (not a `..` segment)
        {
            code: `new ModelAndView('v1.2')`,
            filename: FILENAME,
        },
        {
            code: `resolver.resolveViewName('my.file')`,
            filename: FILENAME,
        },
        // Nested names are a supported, documented spelling (isSafeViewName allows separators)
        {
            code: `new ModelAndView('admin/user')`,
            filename: FILENAME,
        },
        {
            code: `resolver.resolveViewName('admin/users')`,
            filename: FILENAME,
        },
        // Dynamic expressions are not inspected
        {
            code: `new ModelAndView(viewName)`,
            filename: FILENAME,
        },
        {
            code: `resolver.resolveViewName(\`\${prefix}/home\`)`,
            filename: FILENAME,
        },
        // ModelAndView instance form is not a literal
        {
            code: `new ModelAndView(new IslandView('todo-app'))`,
            filename: FILENAME,
        },
        // EJSView takes a template path, not a view name — separators are expected
        {
            code: `new EJSView('pages/home.html', { loader })`,
            filename: '/packages/ndigo-app/src/views.ts',
        },
        // Unrelated calls with the same first argument
        {
            code: `other('..')`,
            filename: '/packages/ndigo-app/src/views.ts',
        },
        ...viewParityValid,
        ...islandParityValid,
    ],
    invalid: [
        // `..` segment
        {
            code: `new ModelAndView('../secret')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        {
            code: `new ModelAndView('..')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // Matrix-parameter spelling of a `..` segment
        {
            code: `new ModelAndView('..;x=1')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // Absolute marker
        {
            code: `resolver.resolveViewName('/etc/passwd')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        {
            code: `resolveViewName('C:\\\\windows')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // NUL byte
        {
            code: `new ModelAndView('home\\u0000.png')`,
            filename: FILENAME,
            errors: [{ messageId: 'unsafeViewName' }],
        },
        // IslandView validates the custom-element grammar, not the path contract (REU-1)
        {
            code: `new IslandView('MyElement')`,
            filename: '/packages/ndigo-app/src/views.ts',
            errors: [{ messageId: 'invalidIslandViewName' }],
        },
        {
            code: `new IslandView('plain')`,
            filename: '/packages/ndigo-app/src/views.ts',
            errors: [{ messageId: 'invalidIslandViewName' }],
        },
        // `admin/user` is safe as a path but not a valid tag name
        {
            code: `new IslandView('admin/user')`,
            filename: '/packages/ndigo-app/src/views.ts',
            errors: [{ messageId: 'invalidIslandViewName' }],
        },
        ...viewParityInvalid,
        ...islandParityInvalid,
    ],
});
