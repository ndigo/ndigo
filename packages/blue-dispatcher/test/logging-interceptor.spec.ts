/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route } from '@blue/router';
import { ModelAndView } from '../src/model-and-view';
import { LoggingRouteHandlerInterceptor, type InterceptorLogger } from '../src/logging-interceptor';

describe('LoggingRouteHandlerInterceptor', () => {
    describe('with injected logger', () => {
        let interceptor: LoggingRouteHandlerInterceptor;
        let mockLogger: InterceptorLogger;

        beforeEach(() => {
            mockLogger = {
                info: vi.fn(),
                error: vi.fn(),
            };
            interceptor = new LoggingRouteHandlerInterceptor(mockLogger);
        });

        it('should log preHandle with structured attributes', async () => {
            const route = { path: '/test/log' } as unknown as Route;

            await interceptor.preHandle(route, {});

            expect(mockLogger.info).toHaveBeenCalledWith(
                '[Dispatcher] -> Handling route',
                expect.objectContaining({ 'route.path': '/test/log' })
            );
        });

        it('should log postHandle with duration and view name', async () => {
            const route = { path: '/test/log' } as unknown as Route;
            const mv = new ModelAndView('test-view');

            await interceptor.preHandle(route, {});
            await interceptor.postHandle(route, {}, mv);

            expect(mockLogger.info).toHaveBeenCalledWith(
                '[Dispatcher] <- Handled route',
                expect.objectContaining({
                    'route.path': '/test/log',
                    'view.name': 'test-view',
                    'handler.duration_ms': expect.any(Number),
                })
            );
        });

        it('should log completeHandle on error', async () => {
            const route = { path: '/test/error' } as unknown as Route;
            const error = new Error('Test Error');

            await interceptor.preHandle(route, {});
            await interceptor.completeHandle(route, {}, error);

            expect(mockLogger.error).toHaveBeenCalledWith(
                '[Dispatcher] x- Failed route',
                error,
                expect.objectContaining({
                    'route.path': '/test/error',
                    'handler.duration_ms': expect.any(Number),
                })
            );
        });

        it('should not log error on completeHandle without error', async () => {
            const route = { path: '/test/ok' } as unknown as Route;

            await interceptor.preHandle(route, {});
            await interceptor.completeHandle(route, {}, null as unknown as Error);

            expect(mockLogger.error).not.toHaveBeenCalled();
        });
    });
});
