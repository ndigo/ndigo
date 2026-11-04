/**
 * The shared page chrome and small render helpers used by both views: the
 * orange navigation bar, the connection banner that reports cache provenance,
 * story rows, skeleton rows, and the recursive comment renderer.
 *
 * Plain DOM construction (no innerHTML interpolation of API data) keeps the
 * untrusted HN payload from ever being parsed as markup.
 *
 * @module ndigo-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FEED_LABELS, FEED_KEYS, FEED_ROUTES, type HnFeedKey, type HnItem } from '../hn-types';
import type { HnCommentNode, HnConnectionState, HnFeedState } from '../services/hn-service';

/** Creates an element with an optional class and text. */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

/** The hash href of a feed tab. */
function feedHref(key: HnFeedKey): string {
    return `#${FEED_ROUTES[key]}`;
}

/**
 * Renders the orange Hacker News navigation bar.
 *
 * @param active - The active feed, or `null` on the item page.
 * @returns The navigation element.
 */
export function navBar(active: HnFeedKey | null): HTMLElement {
    const header = el('header', 'hn-nav');
    const brand = el('a', 'hn-brand', 'Hacker News');
    brand.setAttribute('href', '#/');
    const tabs = el('ul', 'hn-tabs');
    for (const key of FEED_KEYS) {
        const item = el('li');
        const link = el('a', active === key ? 'active' : undefined, FEED_LABELS[key]);
        link.setAttribute('href', feedHref(key));
        item.append(link);
        tabs.append(item);
    }
    header.append(brand, tabs);
    return header;
}

/** Formats an epoch-ms timestamp as a coarse "… ago" string. */
function formatAge(epochMs: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - epochMs) / 1000));
    if (seconds < 60) {
        return `${seconds}s ago`;
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return `${minutes} min ago`;
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return `${hours} h ago`;
    }
    return `${Math.round(hours / 24)} d ago`;
}

/** Formats an HN `time` field (Unix seconds) as a coarse age. */
export function formatItemAge(time: number | undefined): string {
    if (typeof time !== 'number' || !Number.isFinite(time)) {
        return '';
    }
    return formatAge(time * 1000);
}

/** The banner for a resource whose provenance is known. */
export interface ConnectionView {
    readonly connection: HnConnectionState;
    readonly source: HnFeedState['source'];
    readonly storedAt: number | null;
}

/**
 * Renders the connection banner: offline, stale-served, cache-served, or plain
 * online. This is where the cache story becomes visible.
 *
 * @param view - The connectivity state plus the active resource's provenance.
 * @returns The banner element.
 */
export function connectionBanner(view: ConnectionView): HTMLElement {
    const banner = el('div', 'conn-banner');
    const { online, servedStale } = view.connection;
    if (!online) {
        banner.classList.add('offline');
        banner.textContent =
            view.storedAt === null
                ? 'offline — waiting for connectivity (requests are queued and replayed)'
                : `offline — showing a cached copy (stored ${formatAge(view.storedAt)})`;
    } else if (view.source === 'stale') {
        banner.classList.add('stale');
        banner.textContent = `stale snapshot served from cache (stored ${
            view.storedAt === null ? 'earlier' : formatAge(view.storedAt)
        }) — revalidating`;
    } else if (view.source === 'cache') {
        const note = el('span', 'source-cache', 'served from the HTTP response cache (inside TTL)');
        banner.append(note);
    } else {
        banner.textContent = 'online — live from the HN API';
    }
    if (servedStale > 0) {
        banner.setAttribute('data-stale-serves', String(servedStale));
        const counter = el('span', 'muted', ` · stale serves this session: ${servedStale}`);
        banner.append(counter);
    }
    return banner;
}

/**
 * Decodes HN's HTML entities without ever parsing untrusted markup into the
 * DOM: a `textarea` is a raw-text element, so assigning its `innerHTML` yields
 * the decoded string and can never create an element or run a handler.
 */
function decodeEntities(value: string): string {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = value;
    return decoder.value;
}

/**
 * Turns an HN `text` field (HTML-ish: `<p>` breaks, `<a href>` links, entities)
 * into safe plain-text paragraphs.
 *
 * Links become `TEXT (URL)` text, remaining tags are stripped, and entities are
 * decoded — the result is rendered as `textContent`, so no markup is trusted.
 *
 * @param text - The raw HN text field.
 * @returns One string per paragraph (empty when there is no text).
 */
function hnParagraphs(text: string | undefined): string[] {
    if (!text) {
        return [];
    }
    const withLinks = text.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gis, '$2 ($1)');
    const withBreaks = withLinks.replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<br\s*\/?>/gi, '\n');
    const stripped = withBreaks.replace(/<[^>]+>/g, '');
    return decodeEntities(stripped)
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0);
}

/**
 * Renders a text block (story body or comment) as one element per paragraph.
 *
 * @param text - The raw HN text field.
 * @param className - The class applied to each paragraph.
 * @returns The paragraph elements (`[no text]` when empty).
 */
export function textParagraphs(text: string | undefined, className: string): HTMLElement[] {
    const paragraphs = hnParagraphs(text);
    return paragraphs.length > 0
        ? paragraphs.map((paragraph) => el('p', className, paragraph))
        : [el('p', className, '[no text]')];
}

/** Renders a placeholder story row. */
export function skeletonRow(): HTMLElement {
    const row = el('li', 'skeleton-row');
    row.append(el('span', 'skeleton rank'), el('span', 'skeleton title'), el('span', 'skeleton meta'));
    return row;
}

/** Renders the story list skeleton. */
export function skeletonList(count = 8): HTMLElement {
    const list = el('ol', 'story-list');
    let index = 0;
    while (index < count) {
        list.append(skeletonRow());
        index += 1;
    }
    return list;
}

/** The external host of a story URL (for the `(domain)` suffix). */
export function storyDomain(url: string | undefined): string {
    if (!url) {
        return '';
    }
    try {
        return new URL(url).host.replace(/^www\./, '');
    } catch {
        return '';
    }
}

/**
 * Renders one story row: rank, title (external link or the internal thread),
 * domain, and the score/age/comments meta line.
 *
 * @param item - The hydrated story.
 * @param rank - The 1-based rank in the list.
 * @returns The rendered list item.
 */
export function storyRow(item: HnItem, rank: number): HTMLElement {
    const row = el('li', 'story-row');
    row.setAttribute('data-item-id', String(item.id));
    row.append(el('span', 'story-rank', String(rank)));

    const body = el('div', 'story-body');
    const title = el('a', 'story-title', item.title ?? `Item ${item.id}`);
    title.setAttribute('href', item.url ?? `#/item/${item.id}`);
    if (item.url) {
        title.setAttribute('rel', 'noopener noreferrer');
        title.setAttribute('target', '_blank');
    }
    body.append(title);

    const domain = storyDomain(item.url);
    if (domain) {
        body.append(document.createTextNode(' '), el('span', 'story-domain', `(${domain})`));
    }

    const meta = el('div', 'story-meta');
    meta.append(document.createTextNode(`${item.score ?? 0} points by ${item.by ?? 'unknown'} `));
    const age = formatItemAge(item.time);
    if (age) {
        meta.append(document.createTextNode(`${age} `));
    }
    const comments = el('a', undefined, `${item.descendants ?? item.kids?.length ?? 0} comments`);
    comments.setAttribute('href', `#/item/${item.id}`);
    meta.append(document.createTextNode('| '), comments);
    body.append(meta);

    row.append(body);
    return row;
}

/** Renders a row for an item whose hydration failed. */
export function failedRow(rank: number): HTMLElement {
    const row = el('li', 'story-row');
    row.append(el('span', 'story-rank', String(rank)), el('span', 'muted', 'could not load this item'));
    return row;
}

/** Renders an error box with a retry action. */
export function errorState(message: string | null, retry: () => void): HTMLElement {
    const box = el('div', 'error-state');
    box.append(el('p', undefined, message ?? 'Something went wrong.'));
    const button = el('button', undefined, 'Retry');
    button.addEventListener('click', retry);
    box.append(button);
    return box;
}

/**
 * Renders the bounded comment tree recursively.
 *
 * @param nodes - The comment nodes (already bounded by the service).
 * @returns A `ul` of comment nodes.
 */
export function commentTree(nodes: readonly HnCommentNode[]): HTMLElement {
    const list = el('ul', 'comment-list');
    for (const node of nodes) {
        list.append(commentNode(node));
    }
    return list;
}

/** Renders one comment and its children. */
function commentNode(node: HnCommentNode): HTMLElement {
    const wrapper = el('li');
    const article = el('article', `comment depth-${node.depth}`);
    article.setAttribute('data-comment-id', String(node.item.id));
    const head = el('div', 'comment-head');
    head.textContent = `${node.item.by ?? 'unknown'} · ${formatItemAge(node.item.time)}${node.item.dead ? ' · flagged' : ''}`;
    article.append(head);
    const body = el('div', 'comment-body');
    body.append(...textParagraphs(node.item.text, 'comment-paragraph'));
    article.append(body);
    wrapper.append(article);
    if (node.children.length > 0) {
        wrapper.append(commentTree(node.children));
    }
    return wrapper;
}

/** The notice shown under a truncated comment tree. */
export function depthNote(maxDepth: number): HTMLElement {
    return el('p', 'depth-note', `Threads render to depth ${maxDepth}; deeper replies are not fetched.`);
}

/**
 * Wraps a page body in the nav + connection banner chrome.
 *
 * @param active - The active feed (or `null`).
 * @param banner - The connection banner element.
 * @param body - The page body.
 * @returns The page container.
 */
export function page(active: HnFeedKey | null, banner: HTMLElement, body: HTMLElement): HTMLElement {
    const container = el('div', 'hn-page');
    container.append(navBar(active), banner, body);
    return container;
}
