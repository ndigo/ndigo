/**
 * @author Jeff Rose
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Emitter } from '@blue/context';
import { OfflineInterceptor } from '../src/offline-interceptor';

describe('OfflineInterceptor', () => {
    let emitter: any;
    let onLineSpy: any;

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
        const offlineHandler = (vi.mocked(window.addEventListener).mock.calls.find(
            (call: any[]) => call[0] === 'offline'
        ) as any[])[1];

        let emittedEvent: any = null;
        emitter.on('offline', (data) => { emittedEvent = data; });

        offlineHandler();

        expect(interceptor.isOnline).toBe(false);
        expect(emittedEvent).toEqual({ isOnline: false, timestamp: expect.any(Number) });
    });

    test('should emit online event when window online event fires', () => {
        // Start offline so the 'online' event will trigger an update
        onLineSpy.mockReturnValue(false);
        const interceptor = new OfflineInterceptor({}, emitter);
        
        const onlineHandler = (vi.mocked(window.addEventListener).mock.calls.find(
            (call: any[]) => call[0] === 'online'
        ) as any[])[1];

        let emittedEvent: any = null;
        emitter.on('online', (data: any) => { emittedEvent = data; });

        onlineHandler();

        expect(interceptor.isOnline).toBe(true);
        expect(emittedEvent).toEqual({ isOnline: true, timestamp: expect.any(Number) });
    });

    test('should update status via heartbeat when navigator.onLine changes', () => {
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);
        
        let emittedEvent: any = null;
        emitter.on('offline', (data) => { emittedEvent = data; });

        // Simulate going offline
        onLineSpy.mockReturnValue(false);
        
        vi.advanceTimersByTime(1000);

        expect(interceptor.isOnline).toBe(false);
        expect(emittedEvent).toEqual({ isOnline: false, timestamp: expect.any(Number) });
    });

    test('should not emit redundant events when status does not change', () => {
        const interceptor = new OfflineInterceptor({ checkInterval: 1000 }, emitter);
        
        let emitCount = 0;
        emitter.on('offline', () => { emitCount++; });
        emitter.on('online', () => { emitCount++; });

        // Advance timer but status is still true
        vi.advanceTimersByTime(1000);

        expect(emitCount).toBe(0);
    });
});
