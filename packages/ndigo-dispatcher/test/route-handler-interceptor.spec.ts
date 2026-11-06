import { describe, expect, test, vi } from 'vitest';
import { URLGlobPathMatcher } from '@ndigo/core';
import type { PathMatcher } from '@ndigo/core';
import type { Route } from '@ndigo/router';
import { MappedHandlerInterceptor, type RouteHandlerInterceptor } from '../src/route-handler-interceptor';
import { ModelAndView } from '../src/model-and-view';

/** Builds a recording delegate interceptor. */
const recordingInterceptor = () => {
    const preHandle = vi.fn(async () => true);
    const postHandle = vi.fn();
    const completeHandle = vi.fn();
    const interceptor: RouteHandlerInterceptor = { preHandle, postHandle, completeHandle };
    return { interceptor, preHandle, postHandle, completeHandle };
};

describe('MappedHandlerInterceptor', () => {
    test('preHandle always delegates — filtering is chain construction’s job (DSV-DISP-5)', async () => {
        const { interceptor, preHandle } = recordingInterceptor();
        const wrapper = new MappedHandlerInterceptor(interceptor, ['/admin/**']);

        // A matcher that rejects every path: pre-fix the dead self-match guard
        // consulted it and short-circuited `preHandle` to `true` without ever
        // delegating. The decorator must not filter — the execution chain
        // already applies `matches` (with the mapping's matcher) when built.
        wrapper.pathMatcher = { match: () => false } as unknown as PathMatcher;

        await expect(wrapper.preHandle({ path: '/public' } as Route, undefined)).resolves.toBe(true);
        expect(preHandle).toHaveBeenCalledTimes(1);
    });

    test('matches() applies the include patterns for chain construction', () => {
        const { interceptor } = recordingInterceptor();
        const wrapper = new MappedHandlerInterceptor(interceptor, ['/admin/**']);

        expect(wrapper.matches('/admin/users', new URLGlobPathMatcher())).toBe(true);
        expect(wrapper.matches('/public', new URLGlobPathMatcher())).toBe(false);
    });

    test('postHandle and completeHandle delegate unchanged', async () => {
        const { interceptor, postHandle, completeHandle } = recordingInterceptor();
        const wrapper = new MappedHandlerInterceptor(interceptor, ['/**']);
        const route = { path: '/x' } as Route;
        const mv = new ModelAndView('view');

        await wrapper.postHandle(route, undefined, mv);
        await wrapper.completeHandle(route, undefined, new Error('boom'));

        expect(postHandle).toHaveBeenCalledWith(route, undefined, mv);
        expect(completeHandle).toHaveBeenCalledWith(route, undefined, expect.any(Error));
    });
});
