/**
 */
import { describe, it, expect } from 'vitest';
import { Route } from '@ndigo/router';
import { IframeViewTarget } from '../src/iframe-view-target';
import { IllegalStateError } from '@ndigo/core';

const mockRoute = { path: '/test' } as Route;

describe('IframeViewTarget', () => {
    it('throws on a null iframe', () => {
        expect(() => new IframeViewTarget(null as never)).toThrow(TypeError);
    });

    it('resolves the body of an about:blank iframe', async () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const target = new IframeViewTarget(iframe);
        await target.prepare(mockRoute);
        expect(target.container).toBeTruthy();
        expect(iframe.contentDocument).not.toBeNull();
    });

    it('throws on a cross-origin iframe', async () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        Object.defineProperty(iframe, 'contentDocument', { get: () => null, configurable: true });
        const target = new IframeViewTarget(iframe);
        const pending = target.prepare(mockRoute);
        iframe.dispatchEvent(new Event('load'));
        await expect(pending).rejects.toThrow(IllegalStateError);
    });

    it('prepare clears the body', async () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const target = new IframeViewTarget(iframe);
        await target.prepare(mockRoute);
        const body = iframe.contentDocument?.body;
        const child = document.createElement('span');
        body?.append(child);
        await target.prepare(mockRoute);
        expect(body?.childElementCount).toBe(0);
    });

    it('commit appends output', async () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const target = new IframeViewTarget(iframe);
        await target.prepare(mockRoute);
        const out = document.createElement('p');
        await target.commit(out, { x: 1 }, mockRoute);
        const body = iframe.contentDocument?.body;
        expect(body?.children.length).toBe(1);
    });

    it('destroy does not remove the iframe', async () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const target = new IframeViewTarget(iframe);
        await target.prepare(mockRoute);
        target.destroy();
        expect(document.body.contains(iframe)).toBe(true);
        expect(target.destroyed).toBe(true);
    });

    it('clear is safe before load', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const target = new IframeViewTarget(iframe);
        expect(() => target.clear()).not.toThrow();
    });
});
