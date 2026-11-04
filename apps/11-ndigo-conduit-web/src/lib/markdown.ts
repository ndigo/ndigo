/**
 * The article-body renderer: a deliberately small Markdown subset, written
 * in-app rather than pulled from a library.
 *
 * RealWorld article bodies are Markdown, and the only place user text becomes
 * markup is this function — so it is written as an **escaping by default**
 * renderer: every character of the source is HTML-escaped, and the only markup
 * that ever reaches the DOM is the fixed set of tags produced below. There is no
 * raw-HTML pass, no attribute passthrough, and link targets are scheme-checked
 * (`javascript:` and `data:` collapse to `#`), so a hostile body cannot escape
 * its text node or smuggle an event handler.
 *
 * Supported: ATX headings (`#`–`######`), fenced code blocks, unordered and
 * ordered lists, blockquotes, paragraphs, and inline `code`, `**bold**`,
 * `*italic*`, and `[label](href)` links. Everything else is literal text — a
 * documented boundary, not an accident.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/** Schemes a rendered link may carry; anything else is neutralized. */
const SAFE_HREF = /^(?:https?:|mailto:|#|\/|\.\/|\.\.\/)/i;

/** Inline constructs, matched in priority order (`**` before `*`). */
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

/** ATX heading. */
const HEADING = /^(#{1,6})\s+(.*)$/;

/** Fenced code block, ``` or ~~~. */
const FENCE = /^(```|~~~)/;

/** Unordered list item. */
const BULLET = /^[-*+]\s+(.*)$/;

/** Ordered list item. */
const ORDERED = /^\d+[.)]\s+(.*)$/;

/** Blockquote line. */
const QUOTE = /^>\s?(.*)$/;

/**
 * Escapes the five HTML-significant characters.
 *
 * @param value - The raw text.
 * @returns Text that is safe inside an HTML text node or quoted attribute.
 */
export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

/**
 * Neutralizes a link target outside the safe scheme set.
 *
 * The scheme check runs on the control-character/whitespace-stripped form,
 * and the *stripped* form is what gets returned (REV-009): browsers strip
 * tab/newline during URL parsing but their whitespace handling is
 * otherwise lenient, so a control-char-tainted URL that passes the check
 * on its scrubbed copy must not be emitted in its raw shape. Inline
 * regexes never produce spaces inside targets, so the strip is an
 * identity for legitimate links.
 *
 * @param href - The raw target from the Markdown source.
 * @returns The stripped target when it is safe, otherwise `#`.
 */
function safeHref(href: string): string {
    const testable = href.replace(/[\u0000-\u001f\s]/g, '');
    return SAFE_HREF.test(testable) ? testable : '#';
}

/**
 * Renders the inline constructs of a single line of text.
 *
 * Escaping happens **before** any tag is produced for a construct's content, so
 * no user character can terminate a tag or open an attribute.
 *
 * @param text - The raw line text.
 * @returns HTML with escaped text and inline tags.
 */
export function renderInline(text: string): string {
    let output = '';
    let cursor = 0;

    for (const match of text.matchAll(INLINE)) {
        const token = match[0];
        const start = match.index ?? 0;
        output += escapeHtml(text.slice(cursor, start));

        if (token.startsWith('**')) {
            output += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
        } else if (token.startsWith('`')) {
            output += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
        } else if (token.startsWith('*')) {
            output += `<em>${escapeHtml(token.slice(1, -1))}</em>`;
        } else {
            const split = token.indexOf('](');
            const label = token.slice(1, split);
            const href = token.slice(split + 2, -1);
            output += `<a href="${escapeHtml(safeHref(href))}" rel="noopener noreferrer" target="_blank">${escapeHtml(label)}</a>`;
        }

        cursor = start + token.length;
    }

    return output + escapeHtml(text.slice(cursor));
}

/**
 * Renders a Markdown subset to sanitized HTML.
 *
 * @param source - The raw Markdown body.
 * @returns HTML built only from escaped text and this module's fixed tags.
 */
export function renderMarkdown(source: string): string {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const html: string[] = [];

    let index = 0;
    let paragraph: string[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;

    const flushParagraph = (): void => {
        if (paragraph.length > 0) {
            html.push(`<p>${paragraph.map(renderInline).join(' ')}</p>`);
            paragraph = [];
        }
    };

    const flushList = (): void => {
        if (list) {
            const tag = list.ordered ? 'ol' : 'ul';
            html.push(`<${tag}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
            list = null;
        }
    };

    const closeBlocks = (): void => {
        flushParagraph();
        flushList();
    };

    while (index < lines.length) {
        const line = lines[index] ?? '';

        const fence = FENCE.exec(line);
        if (fence) {
            closeBlocks();
            const marker = fence[1] ?? '```';
            const body: string[] = [];
            index += 1;
            while (index < lines.length && !(lines[index] ?? '').startsWith(marker)) {
                body.push(lines[index] ?? '');
                index += 1;
            }
            index += 1;
            html.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
            continue;
        }

        if (line.trim().length === 0) {
            closeBlocks();
            index += 1;
            continue;
        }

        const heading = HEADING.exec(line);
        if (heading) {
            closeBlocks();
            const level = (heading[1] ?? '#').length;
            html.push(`<h${level}>${renderInline(heading[2] ?? '')}</h${level}>`);
            index += 1;
            continue;
        }

        const quote = QUOTE.exec(line);
        if (quote) {
            closeBlocks();
            html.push(`<blockquote>${renderInline(quote[1] ?? '')}</blockquote>`);
            index += 1;
            continue;
        }

        const bullet = BULLET.exec(line);
        const ordered = bullet ? null : ORDERED.exec(line);
        if (bullet || ordered) {
            flushParagraph();
            const isOrdered = ordered !== null;
            if (!list || list.ordered !== isOrdered) {
                flushList();
                list = { ordered: isOrdered, items: [] };
            }
            list.items.push((bullet?.[1] ?? ordered?.[1] ?? '').trim());
            index += 1;
            continue;
        }

        flushList();
        paragraph.push(line.trim());
        index += 1;
    }

    closeBlocks();
    return html.join('\n');
}
