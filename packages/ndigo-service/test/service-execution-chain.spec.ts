/**
 * @module ndigo-service
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { IllegalStateError } from '@ndigo/core';
import { ServiceExecutionChain, Service, ServiceInterceptor } from '../src/service';

describe('ServiceExecutionChain', () => {
    test('it should add interceptors through constructor array', () => {
        const service = {} as Service;
        const interceptors = [{ preInit: () => true }, { postRequest: () => void 0 }];

        const chain = new ServiceExecutionChain(service, [interceptors[0], interceptors[1]] as ServiceInterceptor[]);

        expect(chain.service).toBe(service);
        expect(chain.interceptors).toHaveLength(2);
    });

    test('it should copy service reference when constructed from another chain', () => {
        const service = {} as Service;
        const original = new ServiceExecutionChain(service, [{ preInit: () => true }] as ServiceInterceptor[]);

        const copy = new ServiceExecutionChain(original);

        expect(copy.service).toBe(service);
    });

    test('it should add interceptors imperatively', () => {
        const chain = new ServiceExecutionChain({} as Service);
        chain.addInterceptor({ preInit: () => true } as ServiceInterceptor);
        chain.addInterceptors([{ postRequest: () => void 0 }] as unknown as ServiceInterceptor[]);

        expect(chain.interceptors).toHaveLength(2);
    });

    test('it should expose Symbol.toStringTag', () => {
        const chain = new ServiceExecutionChain({} as Service);

        expect(chain[Symbol.toStringTag]).toBe('ServiceExecutionChain');
    });

    test('it should ignore null and undefined interceptors', () => {
        const chain = new ServiceExecutionChain({} as Service);

        expect(() => chain.addInterceptor(null as unknown as ServiceInterceptor)).not.toThrow();
        expect(() => chain.addInterceptor(undefined as unknown as ServiceInterceptor)).not.toThrow();
        expect(chain.interceptors).toEqual([]);
    });

    test('it should reject invalid interceptors', () => {
        const chain = new ServiceExecutionChain({} as Service);

        expect(() => chain.addInterceptor({ nope: true } as unknown as ServiceInterceptor)).toThrow(IllegalStateError);
    });

    test('it should copy and merge interceptors when constructed from another chain', () => {
        const service = {} as Service;
        const original = new ServiceExecutionChain(service, [{ preInit: () => true }] as ServiceInterceptor[]);
        const copy = new ServiceExecutionChain(original, [
            { postRequest: () => void 0 },
        ] as unknown as ServiceInterceptor[]);

        expect(copy.service).toBe(service);
        expect(copy.interceptors).toHaveLength(2);
    });
});
