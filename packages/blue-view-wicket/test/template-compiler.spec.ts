import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { DATA_W_FRAGMENT, DATA_W_ID, TemplateCompiler } from '../src/template-compiler';

describe('TemplateCompiler', () => {
    it('compiles HTML into a fragment root', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile('<html><body><div><span>Hi</span></div></body></html>');

        expect(compiled.root.nodeType).toBe(11);
        expect(compiled.root.childNodes.length).toBe(1);
    });

    it('captures a data-w-id binding slot', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile('<html><body><div data-w-id="title"></div></body></html>');

        expect(compiled.slots.size).toBe(1);
        expect(compiled.slots.get('title')?.id).toBe('title');
        expect(compiled.slots.get('title')?.element.getAttribute('data-w-id')).toBe('title');
    });

    it('handles multiple data-w-id elements', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile(
            '<html><body><div data-w-id="a"></div><div data-w-id="b"></div></body></html>'
        );

        expect(compiled.slots.size).toBe(2);
        expect(compiled.slots.has('a')).toBe(true);
        expect(compiled.slots.has('b')).toBe(true);
    });

    it('handles nested data-w-id elements', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile(
            '<html><body><section data-w-id="outer"><div data-w-id="inner"></div></section></body></html>'
        );

        expect(compiled.slots.size).toBe(2);
        expect(compiled.slots.has('outer')).toBe(true);
        expect(compiled.slots.has('inner')).toBe(true);
    });

    it('returns empty slots when no data-w-id attributes exist', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile('<html><body><div><span>No bindings</span></div></body></html>');

        expect(compiled.slots.size).toBe(0);
    });

    it('preserves HTML structure in the root fragment', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        const compiled = compiler.compile('<html><body><div class="root"><span>Text</span></div></body></html>');
        const rootElement = compiled.root.firstElementChild as Element | null;

        expect(rootElement?.tagName.toLowerCase()).toBe('div');
        expect(rootElement?.getAttribute('class')).toBe('root');
        expect(rootElement?.firstElementChild?.tagName.toLowerCase()).toBe('span');
    });

    it('exposes Symbol.toStringTag', () => {
        const dom = new LinkedomDOMProvider();
        const compiler = new TemplateCompiler(dom);

        expect(Object.prototype.toString.call(compiler)).toBe('[object TemplateCompiler]');
    });
});

describe('template-compiler constants', () => {
    it('exports DATA_W_ID', () => {
        expect(DATA_W_ID).toBe('data-w-id');
    });

    it('exports DATA_W_FRAGMENT', () => {
        expect(DATA_W_FRAGMENT).toBe('data-w-fragment');
    });
});
