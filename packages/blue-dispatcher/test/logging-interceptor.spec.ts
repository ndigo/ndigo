import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route } from '@blue/router';
import { ModelAndView } from '../src/model-and-view';
import { LoggingRouteHandlerInterceptor } from '../src/logging-interceptor';

describe('LoggingRouteHandlerInterceptor', () => {
    let interceptor: LoggingRouteHandlerInterceptor;
    let consoleLogSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        interceptor = new LoggingRouteHandlerInterceptor();
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log preHandle and postHandle', async () => {
        const route = { path: '/test/log' } as Route;
        const mv = new ModelAndView('test-view');

        await interceptor.preHandle(route, {});
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dispatcher] -> Handling route: /test/log');

        await interceptor.postHandle(route, {}, mv);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Dispatcher] <- Handled route: /test/log'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('View: test-view'));
    });

    it('should log completeHandle on error', async () => {
        const route = { path: '/test/error' } as Route;
        const error = new Error('Test Error');

        await interceptor.preHandle(route, {});
        await interceptor.completeHandle(route, {}, error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Dispatcher] x- Failed route: /test/error')
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Test Error'));
    });
});
