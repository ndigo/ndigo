/**
 * Browser online/offline reconnect trigger (AD-22 D3/D6).
 *
 * The browser-global half of the client reconnect wiring: `@blue/socket`'s
 * `WebSocketClient` stays isomorphic while this package provides the
 * window/`navigator` surface (AD-4 boundary).
 * * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { signal, type Signal } from '@blue/signals';
import { type ReconnectTrigger } from '@blue/socket';

/**
 * Browser-backed `ReconnectTrigger` wiring (AD-22 D3).
 */
export interface OnlineReconnectTrigger extends ReconnectTrigger {
    /** True while the browser reports online (`navigator.onLine` + events). */
    readonly online: Signal<boolean>;
    /** Stop listening to window events. Idempotent. */
    dispose(): void;
}

/**
 * Creates the browser connectivity wiring for `WebSocketClient`:
 *
 * - `online` — a signal mirroring `navigator.onLine`, updated by window
 *   `online`/`offline` events;
 * - a {@link ReconnectTrigger} that notifies subscribers on each
 *   **offline → online** transition, so a client in `reconnecting` retries
 *   immediately instead of waiting out its backoff.
 *
 * @example
 * ```ts
 * const trigger = createOnlineReconnectTrigger();
 * const chat = new WebSocketClient(url, { reconnectTrigger: trigger });
 * // …later, on teardown:
 * trigger.dispose();
 * ```
 */
export function createOnlineReconnectTrigger(): OnlineReconnectTrigger {
    const online = signal<boolean>(navigator.onLine);
    const listeners: Array<() => void> = [];
    const onOnline = (): void => {
        if (!online.value) {
            online.value = true;
            for (const listener of [...listeners]) {
                listener();
            }
        }
    };
    const onOffline = (): void => {
        online.value = false;
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return {
        online,
        onChange(listener: () => void): () => void {
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            };
        },
        dispose(): void {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        },
    };
}