/**
 * MCP App documents: inlining, metadata, and breakout rejection.
 */
import { describe, expect, it } from 'vitest';
import { createUiResource, MCP_APP_MIME_TYPE } from '../src/ui-resource';
import type { UiResourceInput } from '../src/ui-resource';

describe('createUiResource', () => {
    it('builds one self-contained document with inlined CSS and a module script', () => {
        const resource = createUiResource({
            uri: 'ui://orders',
            name: 'Orders',
            title: 'Orders <app>',
            body: '<main>Orders</main>',
            trustedMarkup: true,
            css: 'main { color: red; }',
            script: 'console.log("orders");',
            csp: { connectDomains: ['https://api.example.test'] },
            permissions: ['clipboardWrite'],
            prefersBorder: true,
            visibility: ['model', 'app'],
        });

        expect(resource.html.startsWith('<!doctype html>')).toBe(true);
        expect(resource.html).toContain('<style>');
        expect(resource.html).toContain('<script type="module">');
        expect(resource.html).toContain('main { color: red; }');
        expect(resource.html).toContain('<main>Orders</main>');
        expect(resource.html).toContain('Orders &lt;app&gt;');
        expect(resource.ui).toEqual({
            visibility: ['model', 'app'],
            csp: { connectDomains: ['https://api.example.test'] },
            permissions: ['clipboardWrite'],
            prefersBorder: true,
        });
        expect(MCP_APP_MIME_TYPE).toBe('text/html;profile=mcp-app');
    });

    it('rejects CSS or JS that would close its inlined element', () => {
        expect(() =>
            createUiResource({ uri: 'ui://x', name: 'X', body: '', css: 'body{} </style><script>x</script>' })
        ).toThrow(/must not close its <style>/u);
        expect(() =>
            createUiResource({ uri: 'ui://x', name: 'X', body: '', script: 'console.log(1)</script>' })
        ).toThrow(/must not close its <script>/u);
    });

    it('rejects a non-ui URI', () => {
        expect(() => createUiResource({ uri: 'https://example.test', name: 'X', body: '' })).toThrow(/ui:\/\//u);
    });

    it('rejects a script type outside the MCP-approved set', () => {
        const untrustedScriptType: unknown = 'javascript';
        expect(() =>
            createUiResource({
                uri: 'ui://x',
                name: 'X',
                body: '',
                script: 'console.log(1);',
                // Test seam: cast only reaches the runtime value guard.
                scriptType: untrustedScriptType as unknown as UiResourceInput['scriptType'],
            })
        ).toThrow(/must be 'module' or 'classic'/u);
    });

    it('rejects unsafe CSP domains', () => {
        expect(() =>
            createUiResource({ uri: 'ui://x', name: 'X', body: '', csp: { connectDomains: ['https:// ;'] } })
        ).toThrow(/must be a valid URL/u);
        expect(() =>
            createUiResource({
                uri: 'ui://x',
                name: 'X',
                body: '',
                csp: { connectDomains: ['ftp://example.test'] },
            })
        ).toThrow(/must use http, https, ws, or wss/u);
    });

    it('escapes untrusted body markup by default', () => {
        const resource = createUiResource({
            uri: 'ui://orders',
            name: 'Orders',
            body: '<main>Orders</main>',
        });

        expect(resource.html).toContain('&lt;main&gt;Orders&lt;/main&gt;');
    });
});
