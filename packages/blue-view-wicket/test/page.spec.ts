import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { Page } from '../src/page';
import { WicketComponent } from '../src/component';

class TestPage extends Page<string> {
    configureCalls = 0;
    renderCalls = 0;
    detachCalls = 0;

    configure(): void {
        this.configureCalls += 1;
        super.configure();
    }

    renderComponent(dom: unknown, container: unknown): void {
        this.renderCalls += 1;
        super.renderComponent(dom, container);
    }

    detach(): void {
        this.detachCalls += 1;
        super.detach();
    }
}

class TestLeaf extends WicketComponent<string> {
    protected render(): void {
        // no-op
    }
}

describe('Page', () => {
    it('sets id in constructor', () => {
        const page = new Page('page');

        expect(page.id).toBe('page');
    });

    it('renders with configure, renderComponent, detach lifecycle', () => {
        const dom = new LinkedomDOMProvider();
        const host = dom.createElement('div');
        const page = new TestPage('page');
        page.addChild(new TestLeaf('child'));

        page.renderPage(dom, host);

        expect(page.configureCalls).toBe(1);
        expect(page.renderCalls).toBe(1);
        expect(page.detachCalls).toBe(1);
    });

    it('exposes Symbol.toStringTag', () => {
        const page = new Page('page');

        expect(Object.prototype.toString.call(page)).toBe('[object Page]');
    });
});
