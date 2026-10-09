/**
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { renderMarkdown } from '../src/lib/markdown';

/**
 * The renderer is the app's only HTML surface: it must escape by default and
 * emit nothing except its own tags, whatever the article body contains.
 */
describe('renderMarkdown', () => {
    test('escapes raw HTML in text, headings, and code', () => {
        expect(renderMarkdown('<script>alert(1)</script>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
        expect(renderMarkdown('# <img src=x onerror=alert(1)>')).toBe('<h1>&lt;img src=x onerror=alert(1)&gt;</h1>');
        expect(renderMarkdown('```\n<b>bold</b>\n```')).toBe('<pre><code>&lt;b&gt;bold&lt;/b&gt;</code></pre>');
    });

    test('escapes inline code, bold, and italic content', () => {
        expect(renderMarkdown('a `x<y` b')).toBe('<p>a <code>x&lt;y</code> b</p>');
        expect(renderMarkdown('**<b>**')).toBe('<p><strong>&lt;b&gt;</strong></p>');
        expect(renderMarkdown('*<i>*')).toBe('<p><em>&lt;i&gt;</em></p>');
    });

    test('renders headings, lists, and blockquotes', () => {
        expect(renderMarkdown('## Second')).toBe('<h2>Second</h2>');
        expect(renderMarkdown('- one\n- two')).toBe('<ul><li>one</li><li>two</li></ul>');
        expect(renderMarkdown('1. one\n2. two')).toBe('<ol><li>one</li><li>two</li></ol>');
        expect(renderMarkdown('> quoted')).toBe('<blockquote>quoted</blockquote>');
    });

    test('renders links to safe schemes with escaped label and target', () => {
        expect(renderMarkdown('[docs](https://example.com/a?b=1)')).toBe(
            '<p><a href="https://example.com/a?b=1" rel="noopener noreferrer" target="_blank">docs</a></p>'
        );
        expect(renderMarkdown('[x](/local)')).toBe(
            '<p><a href="/local" rel="noopener noreferrer" target="_blank">x</a></p>'
        );
    });

    test('neutralizes a javascript: link target', () => {
        const html = renderMarkdown('[click](javascript:alert(1))');
        expect(html).toContain('href="#"');
        expect(html).not.toContain('javascript:');
    });

    test('a control-character-tainted https target is scrubbed, never emitted raw (REV-009)', () => {
        // The scheme check strips control chars/whitespace before testing;
        // the *stripped* href must be what lands in the document.
        const html = renderMarkdown('[ok](https://example.com/a\u0000b)');
        expect(html).toContain('href="https://example.com/ab"');
        expect(html).not.toContain('\u0000');

        // A javascript: target remains neutralized even with the taint.
        const blocked = renderMarkdown('[x](jav\u0000ascript:alert(1))');
        expect(blocked).toContain('href="#"');
        expect(blocked).not.toContain('javascript:');
    });

    test('joins consecutive lines into one paragraph and splits on a blank line', () => {
        expect(renderMarkdown('one\ntwo\n\nthree')).toBe('<p>one two</p>\n<p>three</p>');
    });

    test('an empty body renders empty', () => {
        expect(renderMarkdown('')).toBe('');
    });
});
