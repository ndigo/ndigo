import { describe, expect, it, vi } from 'vitest';
import { AttributeModifier, CSSClassAppender } from '../src/attribute-modifier';

describe('AttributeModifier', () => {
    it('exposes Symbol.toStringTag as AttributeModifier', () => {
        const modifier = new AttributeModifier('data-role', 'admin');

        expect(Object.prototype.toString.call(modifier)).toBe('[object AttributeModifier]');
    });

    it('returns attribute name from getter', () => {
        const modifier = new AttributeModifier('aria-label', 'Label');

        expect(modifier.attribute).toBe('aria-label');
    });

    it('sets attribute with a static string value', () => {
        const element = document.createElement('div');
        const modifier = new AttributeModifier('data-state', 'ready');

        modifier.applyTo(element);

        expect(element.getAttribute('data-state')).toBe('ready');
    });

    it('sets attribute using a function value', () => {
        const element = document.createElement('div');
        element.setAttribute('data-count', '1');
        const computeNext = vi.fn((current: string | null) => `${current}-next`);
        const modifier = new AttributeModifier('data-count', computeNext);

        modifier.applyTo(element);

        expect(computeNext).toHaveBeenCalledWith('1');
        expect(element.getAttribute('data-count')).toBe('1-next');
    });

    it('removes the attribute when the function returns null', () => {
        const element = document.createElement('div');
        element.setAttribute('data-remove', 'value');
        const modifier = new AttributeModifier('data-remove', () => null);

        modifier.applyTo(element);

        expect(element.hasAttribute('data-remove')).toBe(false);
    });

    it('passes null to the function when the attribute does not exist', () => {
        const element = document.createElement('div');
        const computeNext = vi.fn(() => 'new');
        const modifier = new AttributeModifier('data-missing', computeNext);

        modifier.applyTo(element);

        expect(computeNext).toHaveBeenCalledWith(null);
        expect(element.getAttribute('data-missing')).toBe('new');
    });

    it('applies to component._element when afterRender is called', () => {
        const element = document.createElement('span');
        const modifier = new AttributeModifier('data-bound', 'true');

        modifier.afterRender({ _element: element });

        expect(element.getAttribute('data-bound')).toBe('true');
    });

    it('does nothing when afterRender receives a component without _element', () => {
        const modifier = new AttributeModifier('data-ignore', 'value');

        expect(() => modifier.afterRender({})).not.toThrow();
    });

    it('does nothing when afterRender receives a component with undefined _element', () => {
        const modifier = new AttributeModifier('data-ignore', 'value');

        expect(() => modifier.afterRender({ _element: undefined })).not.toThrow();
    });
});

describe('CSSClassAppender', () => {
    it('exposes Symbol.toStringTag as CSSClassAppender', () => {
        const appender = new CSSClassAppender('active');

        expect(Object.prototype.toString.call(appender)).toBe('[object CSSClassAppender]');
    });

    it('returns class name from getter', () => {
        const appender = new CSSClassAppender('highlight');

        expect(appender.className).toBe('highlight');
    });

    it('sets class when no existing class is present', () => {
        const element = document.createElement('div');
        const appender = new CSSClassAppender('first');

        appender.applyTo(element);

        expect(element.getAttribute('class')).toBe('first');
    });

    it('appends class to existing class list', () => {
        const element = document.createElement('div');
        element.setAttribute('class', 'alpha');
        const appender = new CSSClassAppender('beta');

        appender.applyTo(element);

        expect(element.getAttribute('class')).toBe('alpha beta');
    });

    it('does not duplicate an existing class', () => {
        const element = document.createElement('div');
        element.setAttribute('class', 'alpha beta');
        const appender = new CSSClassAppender('beta');

        appender.applyTo(element);

        expect(element.getAttribute('class')).toBe('alpha beta');
    });

    it('applies to component._element when afterRender is called', () => {
        const element = document.createElement('div');
        const appender = new CSSClassAppender('ready');

        appender.afterRender({ _element: element });

        expect(element.getAttribute('class')).toBe('ready');
    });

    it('does nothing when afterRender receives a component without _element', () => {
        const appender = new CSSClassAppender('ready');

        expect(() => appender.afterRender({})).not.toThrow();
    });
});
