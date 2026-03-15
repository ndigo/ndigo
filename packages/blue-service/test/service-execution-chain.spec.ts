import { describe, expect, test } from 'vitest';
import { ServiceExecutionChain } from '../src/service';

describe('ServiceExecutionChain', () => {
    test('it should add interceptors through constructor array', () => {
        const service = {} as any;
        const interceptors = [{ preInit: () => true }, { postRequest: () => void 0 }];

        const chain = new ServiceExecutionChain(service, interceptors as any);

        expect(chain.service).toBe(service);
        expect(chain.interceptors).toHaveLength(2);
    });

    test('it should copy service reference when constructed from another chain', () => {
        const service = {} as any;
        const original = new ServiceExecutionChain(service, [{ preInit: () => true }] as any);

        const copy = new ServiceExecutionChain(original);

        expect(copy.service).toBe(service);
    });

    test('it should add interceptors imperatively', () => {
        const chain = new ServiceExecutionChain({} as any);
        chain.addInterceptor({ preInit: () => true } as any);
        chain.addInterceptors([{ postRequest: () => void 0 }] as any);

        expect(chain.interceptors).toHaveLength(2);
    });

    test('it should expose Symbol.toStringTag', () => {
        const chain = new ServiceExecutionChain({} as any);

        expect(chain[Symbol.toStringTag]).toBe('ServiceExecutionChain');
    });
});
