import { describe, test, expect, vi } from 'vitest';
import RouterExecutionChain from '../src/router-execution-chain';
import { PathRoute } from '../src/path-route';
import { RouterInterceptor } from '../src/router-interceptor';

describe('RouterExecutionChain', () => {
    test('it should create an empty chain by default', () => {
        const chain = new RouterExecutionChain();
        expect(chain.interceptors).toEqual([]);
        expect(chain.interceptorIndex).toBe(-1);
        expect(Object.prototype.toString.call(chain)).toContain('RouterExecutionChain');
    });

    test('it should add interceptors from array constructor', () => {
        const first: RouterInterceptor = { preRoute: () => true };
        const second: RouterInterceptor = { preRoute: () => true };
        const chain = new RouterExecutionChain([first, second]);

        expect(chain.interceptors.length).toBe(2);
    });

    test('it should copy interceptors from another chain', () => {
        const first: RouterInterceptor = { preRoute: () => true };
        const source = new RouterExecutionChain([first]);
        const target = new RouterExecutionChain(source);

        expect(target.interceptors.length).toBe(1);
    });

    test('it should stop pre-route execution when interceptor rejects', () => {
        const first = vi.fn(() => true);
        const second = vi.fn(() => false);
        const third = vi.fn(() => true);
        const chain = new RouterExecutionChain([{ preRoute: first }, { preRoute: second }, { preRoute: third }]);

        const result = chain.applyPreRoute(new PathRoute('/foo'));

        expect(result).toBe(false);
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
        expect(third).not.toHaveBeenCalled();
    });

    test('it should apply post-route callbacks for all interceptors', () => {
        const first = vi.fn();
        const second = vi.fn();
        const chain = new RouterExecutionChain([{ postRoute: first }, { postRoute: second }]);

        chain.applyPostRoute(new PathRoute('/foo'));

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });
});
