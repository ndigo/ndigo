/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { Emitter, EventEmitter } from '@ndigo/context';
import { OfflineInterceptor } from '../src/offline-interceptor';

describe('OfflineInterceptor', () => {
    let emitter: EventEmitter;
    let onLineSpy: Mock<() => boolean>;

    beforeEach(() => {
        emitter = new Emitter();
        vi.useFakeTimers();

        onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
        vi.spyOn(window, 'addEventListener');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('should have correct initial online status', () => {
        const interceptor = new OfflineInterceptor({}, emitter);
        expect(interceptor.isOnline).toBe(true);
    });

    test('should emit offline event when window offline event fires', () => {
        const interceptor = new OfflineInterceptor({}, emitter);
        const offlineCall = (
            vi.mocked(window.addEventListener).mock.calls as unknown as Array<[string, () => void]>
        ).find((call) => call[0] === 'offline');
        if (!offlineCall) {
            throw new Error('offline listener was not registered');
        }
        const offlineHandler = offlineCall[1];

        let emittedEvent: unknown = null;
        emitter.on('offline', (data: unknown) => {
            emittedEvent = data;
        });

        offlineHandler();

        expect(interceptor.isOnline).toBe(false);
        expect(emittedEvent).toEqual({ isOnline: false, timestamp: expect.any(Number) });
    });

    test('should emit online event when window online event fires', () => {
        // Start offline so the 'online' event will trigger an update
        onLineSpy.mockReturnValue(false);
        const interceptor = new OfflineInterceptor({}, emitter);

        const onlineCall = (
            vi.mocked(window.addEventListener).mock.calls as unknown as Array<[string, () => void]>
        ).find((call) => call[0] === 'online');
        if (!onlineCall) {
            throw new Error('online listener was not registered');
        }
        const onlineHandler = onlineCall[1];

        let emittedEvent: unknown = null;
        emitter.on('online', (data: unknown) => {
            emittedEvent = data;
        });

        onlineHandler();

        expect(interceptor.isOnline).toBe(true);
        expect(emittedEvent).toEqual({ isOnline: true, timestamp: expect.any(Number) });
    });

    test('should update status via heartbeat when navigator.onLine changes', () => {
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);

        let emittedEvent: unknown = null;
        emitter.on('offline', (data: unknown) => {
            emittedEvent = data;
        });

        // Simulate going offline
        onLineSpy.mockReturnValue(false);

        vi.advanceTimersByTime(1000);

        expect(interceptor.isOnline).toBe(false);
        expect(emittedEvent).toEqual({ isOnline: false, timestamp: expect.any(Number) });
    });

    test('should not emit redundant events when status does not change', () => {
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);

        let emitCount = 0;
        emitter.on('offline', () => {
            emitCount++;
        });
        emitter.on('online', () => {
            emitCount++;
        });

        // Advance timer but status is still true
        vi.advanceTimersByTime(1000);

        expect(emitCount).toBe(0);
    });

    test('dispose removes window listeners and stops the heartbeat', () => {
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);

        let emitCount = 0;
        emitter.on('offline', () => {
            emitCount++;
        });

        interceptor.dispose();

        // Window events no longer update the status.
        onLineSpy.mockReturnValue(false);
        window.dispatchEvent(new Event('offline'));
        expect(interceptor.isOnline).toBe(true);

        // The heartbeat no longer polls.
        vi.advanceTimersByTime(5000);
        expect(emitCount).toBe(0);
    });

    test('dispose is idempotent', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);

        interceptor.dispose();
        expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
        expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
        const callsAfterFirstDispose = removeSpy.mock.calls.length;

        interceptor.dispose();
        expect(removeSpy.mock.calls.length).toBe(callsAfterFirstDispose);
    });
});
