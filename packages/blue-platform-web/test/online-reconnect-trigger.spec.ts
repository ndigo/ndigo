/**
 * `createOnlineReconnectTrigger` spec — jsdom window `online`/`offline`
 * events, transition notifications, and disposal (AD-22 D3).
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { createOnlineReconnectTrigger } from '../src/index';

describe('createOnlineReconnectTrigger', () => {
    test('starts at navigator.onLine', () => {
        const trigger = createOnlineReconnectTrigger();
        expect(trigger.online.value).toBe(navigator.onLine);
        trigger.dispose();
    });

    test('tracks window online/offline events', () => {
        const trigger = createOnlineReconnectTrigger();
        window.dispatchEvent(new Event('offline'));
        expect(trigger.online.value).toBe(false);
        window.dispatchEvent(new Event('online'));
        expect(trigger.online.value).toBe(true);
        trigger.dispose();
    });

    test('notifies subscribers only on offline→online transitions', () => {
        const trigger = createOnlineReconnectTrigger();
        const notified = vi.fn();
        trigger.onChange(notified);

        window.dispatchEvent(new Event('online')); // already online
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('offline')); // still offline
        expect(notified).not.toHaveBeenCalled();

        window.dispatchEvent(new Event('online'));
        expect(notified).toHaveBeenCalledTimes(1);
        trigger.dispose();
    });

    test('unsubscribe and dispose detach listeners', () => {
        const trigger = createOnlineReconnectTrigger();
        const notified = vi.fn();
        const unsubscribe = trigger.onChange(notified);

        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
        expect(notified).toHaveBeenCalledTimes(1);

        unsubscribe();
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
        expect(notified).toHaveBeenCalledTimes(1);

        trigger.dispose();
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
        expect(notified).toHaveBeenCalledTimes(1);
    });
});
