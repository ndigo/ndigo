/**
 * `<nd-scroll-area>` — styled viewport with machine-driven scrollbars.
 *
 * The viewport scrolls natively; the machine keeps custom scrollbar thumbs,
 * corner, and hover/drag states in sync. Content that is not wrapped in
 * `root`/`viewport`/`content` is placed into the structure on connect.
 */
import { connect as connectScrollArea, machine as scrollAreaMachine } from '@zag-js/scroll-area';
import type { ScrollToDetails, ScrollToEdgeDetails } from '@zag-js/scroll-area';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

interface ScrollAreaAPI {
    getRootProps(): Record<string, unknown>;
    getViewportProps(): Record<string, unknown>;
    getContentProps(): Record<string, unknown>;
    getScrollbarProps(props?: { orientation?: 'horizontal' | 'vertical' }): Record<string, unknown>;
    getThumbProps(props?: { orientation?: 'horizontal' | 'vertical' }): Record<string, unknown>;
    getCornerProps(): Record<string, unknown>;
    scrollTo(details: ScrollToDetails): void;
    scrollToEdge(details: ScrollToEdgeDetails): void;
}

let nextId = 0;

export class NdScrollArea extends NdElement {
    #machineId = '';
    #controller = createZagElement({
        machine: scrollAreaMachine,
        connect: (service): ScrollAreaAPI => connectScrollArea(service, normalizeProps),
        props: () => ({ id: this.#machineId }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-scroll-area-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    /**
     * Scrolls to the given coordinates, matching the native `scrollTo` overloads
     * so the element remains a valid `HTMLElement`.
     */
    scrollTo(options?: ScrollToOptions): void;
    scrollTo(x: number, y: number): void;
    scrollTo(details: ScrollToDetails): void;
    scrollTo(details: ScrollToDetails | ScrollToOptions | number = {}, y = 0): void {
        if (typeof details === 'number') {
            this.#controller.api?.scrollTo({ left: details, top: y });
            return;
        }
        this.#controller.api?.scrollTo({
            top: details.top,
            left: details.left,
            behavior: details.behavior,
            ...('easing' in details ? { easing: details.easing, duration: details.duration } : {}),
        });
    }

    /** Scrolls to one edge of the viewport. */
    scrollToEdge(details: ScrollToEdgeDetails): void {
        this.#controller.api?.scrollToEdge(details);
    }

    #ensureStructure(): void {
        let root = this.querySelector<HTMLElement>('[data-part="root"]');
        if (!root) {
            root = this.ownerDocument.createElement('div');
            root.dataset.part = 'root';
            root.append(...this.children);
            this.append(root);
        }

        let viewport = root.querySelector<HTMLElement>('[data-part="viewport"]');
        if (!viewport) {
            viewport = this.ownerDocument.createElement('div');
            viewport.dataset.part = 'viewport';
            const movable = [...root.children].filter(
                (child) => !(child instanceof HTMLElement && ['scrollbar', 'corner'].includes(child.dataset.part ?? ''))
            );
            viewport.append(...movable);
            root.prepend(viewport);
        }

        let content = viewport.querySelector<HTMLElement>('[data-part="content"]');
        if (!content) {
            content = this.ownerDocument.createElement('div');
            content.dataset.part = 'content';
            content.append(...viewport.children);
            viewport.append(content);
        }

        if (!root.querySelector('[data-part="scrollbar"][data-orientation="vertical"]')) {
            root.append(this.#createScrollbar('vertical'));
        }
        if (!root.querySelector('[data-part="scrollbar"][data-orientation="horizontal"]')) {
            root.append(this.#createScrollbar('horizontal'));
        }
        if (!root.querySelector('[data-part="corner"]')) {
            const corner = this.ownerDocument.createElement('div');
            corner.dataset.part = 'corner';
            root.append(corner);
        }
    }

    #createScrollbar(orientation: 'horizontal' | 'vertical'): HTMLElement {
        const scrollbar = this.ownerDocument.createElement('div');
        scrollbar.dataset.part = 'scrollbar';
        scrollbar.dataset.orientation = orientation;
        const thumb = this.ownerDocument.createElement('div');
        thumb.dataset.part = 'thumb';
        scrollbar.append(thumb);
        return scrollbar;
    }

    #render(api: ScrollAreaAPI): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const viewport = root?.querySelector<HTMLElement>('[data-part="viewport"]');
        const content = viewport?.querySelector<HTMLElement>('[data-part="content"]');
        const corner = root?.querySelector<HTMLElement>('[data-part="corner"]');

        if (root) spreadProps(root, api.getRootProps());
        if (viewport) spreadProps(viewport, api.getViewportProps());
        if (content) spreadProps(content, api.getContentProps());
        if (corner) spreadProps(corner, api.getCornerProps());

        for (const scrollbar of root?.querySelectorAll<HTMLElement>('[data-part="scrollbar"]') ?? []) {
            const orientation = scrollbar.dataset.orientation === 'horizontal' ? 'horizontal' : 'vertical';
            spreadProps(scrollbar, api.getScrollbarProps({ orientation }));
            const thumb = scrollbar.querySelector<HTMLElement>('[data-part="thumb"]');
            if (thumb) spreadProps(thumb, api.getThumbProps({ orientation }));
        }
    }
}

defineElement('nd-scroll-area', NdScrollArea);
