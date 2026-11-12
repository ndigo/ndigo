/**
 */
import { describe, it, expect } from 'vitest';
import { Route } from '@ndigo/router';
import { ShadowRootViewTarget } from '../src/shadow-root-view-target';
import { IllegalStateError } from '@ndigo/core';

const mockRoute = { path: '/test' } as Route;

describe('ShadowRootViewTarget', () => {
    it('attaches an open shadow root when given an element', () => {
        const host = document.createElement('div');
        const target = new ShadowRootViewTarget(host);
        expect(host.shadowRoot).not.toBeNull();
        expect(target.container).toBe(host.shadowRoot);
    });

    it('reuses an existing open shadow root', () => {
        const host = document.createElement('div');
        const existing = host.attachShadow({ mode: 'open' });
        const target = new ShadowRootViewTarget(host);
        expect(target.container).toBe(existing);
    });

    it('accepts a ShadowRoot directly', () => {
        const host = document.createElement('div');
        const sr = host.attachShadow({ mode: 'open' });
        const target = new ShadowRootViewTarget(sr);
        expect(target.container).toBe(sr);
    });

    it('throws on a closed shadow root', () => {
        const host = document.createElement('div');
        host.attachShadow({ mode: 'closed' });
        expect(() => new ShadowRootViewTarget(host)).toThrow(IllegalStateError);
    });

    it('throws on a null host', () => {
        expect(() => new ShadowRootViewTarget(null as never)).toThrow(TypeError);
    });

    it('prepare clears the shadow root', () => {
        const host = document.createElement('div');
        const target = new ShadowRootViewTarget(host);
        const child = document.createElement('span');
        (target.container as ShadowRoot).append(child);
        target.prepare(mockRoute);
        expect((target.container as ShadowRoot).childElementCount).toBe(0);
    });

    it('commit appends output', () => {
        const host = document.createElement('div');
        const target = new ShadowRootViewTarget(host);
        const out = document.createElement('p');
        target.prepare(mockRoute);
        target.commit(out, { x: 1 }, mockRoute);
        expect((target.container as ShadowRoot).children.length).toBe(1);
    });

    it('commit reuses a matching single child', () => {
        const host = document.createElement('div');
        const target = new ShadowRootViewTarget(host);
        const first = document.createElement('p');
        target.prepare(mockRoute);
        target.commit(first, { x: 1 }, mockRoute);
        const second = document.createElement('p');
        target.commit(second, { x: 2 }, mockRoute);
        expect((target.container as ShadowRoot).children.length).toBe(1);
    });

    it('destroy clears content', () => {
        const host = document.createElement('div');
        const target = new ShadowRootViewTarget(host);
        const out = document.createElement('p');
        target.prepare(mockRoute);
        target.commit(out, {}, mockRoute);
        target.destroy();
        expect((host.shadowRoot as ShadowRoot).childElementCount).toBe(0);
        expect(target.destroyed).toBe(true);
    });
});
