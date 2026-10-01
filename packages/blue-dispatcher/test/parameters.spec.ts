/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { MetadataConfigApplicationContext, configuration, entry } from '@blue/context';
import {
    getMapping,
    requestMapping,
    socketMapping,
    queryValue,
    bodyValue,
    historyStateValue,
    dataBinderValue,
    headerValue,
    parameters,
    RadixMetadataHandlerMapping,
    InvalidParameterMappingError,
    type SocketSession,
} from '../src/index';

/** Ensure parameters on a socket mapping declaring bodyValue throws at registration. */
function bootWith(controller: object): void {
    @configuration
    class Harness {
        @entry() handlerMapping() {
            return new RadixMetadataHandlerMapping();
        }
    }
    const context = new MetadataConfigApplicationContext('params-kind');
    context.register(Harness);
    context.setValue('Controller', controller);
    context.refresh();
    const mapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
    mapping.setApplicationContext(context);
    mapping.init();
}

describe('@parameters source-vs-mapping-kind compatibility', () => {
    test('accepts request-compatible sources on an HTTP mapping', () => {
        @requestMapping('/docs')
        class Good {
            @getMapping('/')
            @parameters({ q: queryValue('q'), b: bodyValue() })
            handle(q: string, b: unknown) {
                return { ok: true };
            }
        }
        expect(() => bootWith(new Good())).not.toThrow();
    });

    test('throws when bodyValue is used on a socket mapping (no body on upgrades)', () => {
        @requestMapping('/ws')
        class Bad {
            @socketMapping('/room')
            @parameters({ payload: bodyValue() })
            async *room(_s: SocketSession) {
                yield 1;
            }
        }
        expect(() => bootWith(new Bad())).toThrow(/body:value/);
    });

    test('throws when a browser-only source (historyStateValue) is used on an HTTP mapping', () => {
        @requestMapping('/api')
        class BadHTTP {
            @getMapping('/x')
            @parameters({ s: historyStateValue('s') })
            handle(_s: unknown) {
                return { ok: true };
            }
        }
        expect(() => bootWith(new BadHTTP())).toThrow(/history-state:value/);
    });

    test('throws when a socket mapping declares a data-binding source (no data binding on upgrades)', () => {
        @requestMapping('/ws')
        class BadSocket {
            @socketMapping('/room')
            @parameters({ form: dataBinderValue('query') })
            async *room(_s: SocketSession) {
                yield 1;
            }
        }
        expect(() => bootWith(new BadSocket())).toThrow(/data-query:value/);
    });

    test('accepts socket-compatible sources (query + header) on a socket mapping', () => {
        @requestMapping('/ws')
        class GoodSocket {
            @socketMapping('/room')
            @parameters({ token: queryValue('token'), via: headerValue('x-via') })
            async *room(_s: SocketSession) {
                yield 1;
            }
        }
        expect(() => bootWith(new GoodSocket())).not.toThrow();
    });

    test('throws InvalidParameterMappingError with the kind message', () => {
        @requestMapping('/e')
        class Err {
            @socketMapping('/e')
            @parameters({ b: bodyValue() })
            async *e(_s: SocketSession) {
                yield 1;
            }
        }
        try {
            bootWith(new Err());
            expect.unreachable('should throw');
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidParameterMappingError);
            expect(String(error)).toMatch(/not available for that mapping kind/);
        }
    });
});
