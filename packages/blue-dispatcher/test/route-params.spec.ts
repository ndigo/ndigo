/**
 * Behavioral tests for @parameters pattern (TC39 parameter injection).
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import {
    parameters,
    queryValue,
    matrixValue,
    cookieValue,
    historyStateValue,
    requestSessionValue,
    sessionStorageValue,
    localStorageValue,
    pathVariable,
    bodyValue,
    fileValue,
    requestPart,
    asNumber,
    asBoolean,
    asDate,
    asJson,
    dataBinderValue,
    resolveParameters,
    getParameterMap,
    MethodParameterType,
} from '../src/parameters';
import { socketMapping } from '../src/socket-mapping';
import { routeMapping } from '../src/route-mapping';
import { RouteHandlerMethod } from '../src/route-handler-method';
import { ParameterBindingError, InvalidParameterMappingError } from '../src/error';
import { QueryValueMethodArgumentResolver } from '../src/argument-resolver';

describe('@parameters - TC39 Parameter Injection Pattern', () => {
    describe('Factory Functions', () => {
        it('queryValue should create query parameter extractor', () => {
            const extractor = queryValue('page');
            expect(extractor.type).toEqual(MethodParameterType.QUERY);
            expect(extractor.name).toBe('page');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('queryValue should accept options', () => {
            const extractor = queryValue('limit', { required: true, defaultValue: '10' });
            expect(extractor.type).toEqual(MethodParameterType.QUERY);
            expect(extractor.name).toBe('limit');
            expect(extractor.required).toBe(true);
            expect(extractor.defaultValue).toBe('10');
            expect(extractor.convertType).toBeUndefined();
        });

        it('queryValue should accept converter option', () => {
            const converter = (value: unknown) => Number(value);
            const extractor = queryValue('limit', { convertType: converter });

            expect(extractor.convertType).toBe(converter);
        });

        it('queryValue should accept named converter option', () => {
            const extractor = queryValue('limit', { convertType: 'number' });

            expect(extractor.convertType).toBe('number');
        });

        it('queryValue should accept optional converter descriptor', () => {
            const extractor = queryValue('limit', { convertType: { optional: true, use: 'number' } });

            expect(extractor.convertType).toEqual({ optional: true, use: 'number' });
        });

        it('matrixValue should create matrix parameter extractor', () => {
            const extractor = matrixValue('color');
            expect(extractor.type).toEqual(MethodParameterType.MATRIX);
            expect(extractor.name).toBe('color');
            expect(extractor.required).toBe(false);
        });

        it('cookieValue should create cookie parameter extractor', () => {
            const extractor = cookieValue('session');
            expect(extractor.type).toEqual(MethodParameterType.COOKIE);
            expect(extractor.name).toBe('session');
            expect(extractor.required).toBe(false);
        });

        it('pathVariable should create path parameter extractor', () => {
            const extractor = pathVariable('userId');
            expect(extractor.type).toEqual(MethodParameterType.PATH);
            expect(extractor.name).toBe('userId');
            expect(extractor.required).toBe(false);
        });

        it('historyStateValue should create history-state parameter extractor', () => {
            const extractor = historyStateValue('token');
            expect(extractor.type).toEqual(MethodParameterType.HISTORY_STATE);
            expect(extractor.name).toBe('token');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('requestSessionValue should create request-session parameter extractor', () => {
            const extractor = requestSessionValue('sessionId');
            expect(extractor.type).toEqual(MethodParameterType.REQUEST_SESSION);
            expect(extractor.name).toBe('sessionId');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('sessionStorageValue should create session-storage parameter extractor', () => {
            const extractor = sessionStorageValue('theme');
            expect(extractor.type).toEqual(MethodParameterType.SESSION_STORAGE);
            expect(extractor.name).toBe('theme');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('localStorageValue should create local-storage parameter extractor', () => {
            const extractor = localStorageValue('token');
            expect(extractor.type).toEqual(MethodParameterType.LOCAL_STORAGE);
            expect(extractor.name).toBe('token');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('dataBinderValue should create a data-{source} parameter extractor', () => {
            const extractor = dataBinderValue('query', undefined, { prefix: 'user.' });
            expect(extractor.type).toEqual(MethodParameterType.data('query'));
            expect(extractor.type.type).toBe('data-query:value');
            expect(extractor.name).toBe('query');
            expect(extractor.prefix).toBe('user.');
        });

        it('dataBinderValue should carry an optional target constructor', () => {
            class ProfileForm {}
            const extractor = dataBinderValue('body', ProfileForm);
            expect(extractor.type).toEqual(MethodParameterType.data('body'));
            expect(extractor.target).toBe(ProfileForm);
        });

        it('MethodParameterType.data round-trips through fromType', () => {
            expect(MethodParameterType.fromType('data-cookie:value')).toEqual(MethodParameterType.data('cookie'));
            expect(MethodParameterType.fromType('path:variable')).toEqual(MethodParameterType.PATH);
            expect(MethodParameterType.fromType('history-state:value')).toEqual(MethodParameterType.HISTORY_STATE);
            expect(MethodParameterType.fromType('request-session:value')).toEqual(MethodParameterType.REQUEST_SESSION);
            expect(MethodParameterType.fromType('session-storage:value')).toEqual(MethodParameterType.SESSION_STORAGE);
            expect(MethodParameterType.fromType('local-storage:value')).toEqual(MethodParameterType.LOCAL_STORAGE);
        });

        describe('Typed Converter Wrappers', () => {
            it('asNumber should wrap extractor with number converter', () => {
                const extractor = asNumber(queryValue('age', { required: true, defaultValue: '18' }));
                expect(extractor.convertType).toEqual({ source: String, target: Number });
                expect(extractor.name).toBe('age');
                expect(extractor.required).toBe(true);
                expect(extractor.defaultValue).toBe('18');
            });

            it('asBoolean should wrap extractor with boolean converter', () => {
                const extractor = asBoolean(historyStateValue('active'));
                expect(extractor.convertType).toEqual({ source: String, target: Boolean });
                expect(extractor.name).toBe('active');
            });

            it('asDate should wrap extractor with date converter', () => {
                const extractor = asDate(cookieValue('lastLogin'));
                expect(extractor.convertType).toEqual({ source: String, target: Date });
                expect(extractor.name).toBe('lastLogin');
            });

            it('asJson should wrap extractor with json converter', () => {
                const extractor = asJson(sessionStorageValue('profile'));
                expect(extractor.convertType).toEqual({ source: String, target: Object });
                expect(extractor.name).toBe('profile');
            });

            it('wrappers should override existing converter', () => {
                const inner = queryValue('age', { convertType: (v: unknown) => v });
                const wrapped = asNumber(inner);
                expect(wrapped.convertType).toEqual({ source: String, target: Number });
            });
        });
    });

    describe('@parameters Decorator (declarative storage + resolution-time conversion)', () => {
        it('stores the raw map declaratively at decoration time', () => {
            class TestController {
                @parameters({ page: queryValue('page') })
                handleQuery(page: string) {}
            }
            const raw = getParameterMap(TestController.prototype, 'handleQuery');
            // @parameters always stores the map; guard here for the typed contract.
            expect(raw).toBeDefined();
            if (raw) {
                expect(raw['page'].type).toEqual(MethodParameterType.QUERY);
                expect(raw['page'].name).toBe('page');
            }
        });

        it('should map single parameter', () => {
            class TestController {
                @parameters({ page: queryValue('page') })
                handleQuery(page: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleQuery',
                TestController.prototype.handleQuery as Function
            );
            expect(params).toHaveLength(1);
            expect(params[0].name).toBe('page');
            expect(params[0].type).toEqual(MethodParameterType.QUERY);
        });

        it('should map multiple parameters', () => {
            class TestController {
                @parameters({
                    page: queryValue('page'),
                    limit: queryValue('limit'),
                })
                handleQuery(page: string, limit: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleQuery',
                TestController.prototype.handleQuery as Function
            );
            expect(params).toHaveLength(2);
            expect(params[0].name).toBe('page');
            expect(params[1].name).toBe('limit');
        });

        it('should handle mixed parameter types', () => {
            class TestController {
                @parameters({
                    page: queryValue('page'),
                    session: cookieValue('SESSIONID'),
                    profile: dataBinderValue('query'),
                    token: historyStateValue('token'),
                    sessionId: requestSessionValue('sessionId'),
                    color: matrixValue('color'),
                    userId: pathVariable('userId'),
                })
                handleMixed(
                    page: string,
                    session: string,
                    profile: object,
                    token: string,
                    sessionId: string,
                    color: string,
                    userId: string
                ) {}
            }
            const fn = TestController.prototype.handleMixed as Function;
            const params = resolveParameters(TestController.prototype, 'handleMixed', fn);
            expect(params).toHaveLength(7);
            expect(params[0].type).toEqual(MethodParameterType.QUERY);
            expect(params[1].type).toEqual(MethodParameterType.COOKIE);
            expect(params[2].type).toEqual(MethodParameterType.data('query'));
            expect(params[3].type).toEqual(MethodParameterType.HISTORY_STATE);
            expect(params[4].type).toEqual(MethodParameterType.REQUEST_SESSION);
            expect(params[5].type).toEqual(MethodParameterType.MATRIX);
            expect(params[6].type).toEqual(MethodParameterType.PATH);
        });

        it('rejects a sparse parameter map at resolution, naming the argument position (HT-11)', () => {
            class TestController {
                @parameters({
                    first: queryValue('first'),
                    third: queryValue('third'),
                })
                handleSparse(first: string, second: string, third: string) {}
            }
            expect(() =>
                resolveParameters(
                    TestController.prototype,
                    'handleSparse',
                    TestController.prototype.handleSparse as Function
                )
            ).toThrowError(InvalidParameterMappingError);
            expect(() =>
                resolveParameters(
                    TestController.prototype,
                    'handleSparse',
                    TestController.prototype.handleSparse as Function
                )
            ).toThrowError(/argument "second" at position 1/);
        });

        it('allows arguments after the last mapped one to stay undeclared (HT-11)', () => {
            class TestController {
                @parameters({ first: queryValue('first') })
                handleTrailing(first: string, untouched: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleTrailing',
                TestController.prototype.handleTrailing as Function
            );
            expect(params).toHaveLength(1);
            expect(params[0].name).toBe('first');
        });

        it('should preserve parameter options', () => {
            class TestController {
                @parameters({ limit: queryValue('limit', { required: true, defaultValue: '10' }) })
                handleQuery(limit: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleQuery',
                TestController.prototype.handleQuery as Function
            );
            expect(params[0].required).toBe(true);
            expect(params[0].defaultValue).toBe('10');
        });

        it('should preserve converter options', () => {
            const converter = (v: unknown) => Number(v);
            class TestController {
                @parameters({ limit: queryValue('limit', { convertType: converter }) })
                handleQuery(limit: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleQuery',
                TestController.prototype.handleQuery as Function
            );
            expect(params[0].convertType).toBe(converter);
        });

        it('should preserve named converter options', () => {
            class TestController {
                @parameters({ limit: queryValue('limit', { convertType: 'number' }) })
                handleQuery(limit: string) {}
            }
            const params = resolveParameters(
                TestController.prototype,
                'handleQuery',
                TestController.prototype.handleQuery as Function
            );
            expect(params[0].convertType).toBe('number');
        });

        it('should throw error if parameter name not found (at resolution, not decoration)', () => {
            class TestController {
                @parameters({ wrongName: queryValue('page') })
                handleQuery(page: string) {}
            }
            expect(() =>
                resolveParameters(
                    TestController.prototype,
                    'handleQuery',
                    TestController.prototype.handleQuery as Function
                )
            ).toThrow('Parameter "wrongName" not found in method signature');
        });
    });

    describe('Integration with Route Mapping', () => {
        it('should work alongside route mapping (resolution-time)', async () => {
            const { routeMapping, getRouteMapping } = await import('../src/route-mapping');

            class TestController {
                @routeMapping('/users')
                @parameters({
                    page: queryValue('page'),
                    limit: queryValue('limit'),
                })
                getUsers(page: string, limit: string) {}
            }

            const mapping = getRouteMapping(TestController.prototype, 'getUsers');
            expect(mapping.value).toBe('/users');

            const params = resolveParameters(
                TestController.prototype,
                'getUsers',
                TestController.prototype.getUsers as Function
            );
            expect(params).toHaveLength(2);
        });
    });

    describe('Socket mapping: @parameters resolves into session.params', () => {
        it('builds a name-ordered parameter list without requiring signature names', () => {
            class SocketController {
                @socketMapping('/room')
                @parameters({
                    token: queryValue('token'),
                    via: queryValue('via'),
                })
                async *room(session: unknown) {
                    yield session;
                }
            }
            const fn = SocketController.prototype.room as Function;
            const params = resolveParameters(SocketController.prototype, 'room', fn);
            expect(params).toHaveLength(2);
            // Parameter carries both the extractor source name and the map key.
            expect(params[0].name).toBe('token');
            expect(params[0].parameterName).toBe('token');
            expect(params[1].parameterName).toBe('via');
            expect(params[1].type).toEqual(MethodParameterType.QUERY);
        });

        it('rejects bodyValue on a socket mapping at resolution time', () => {
            class SocketController {
                @socketMapping('/room')
                @parameters({ payload: bodyValue() })
                async *room(session: unknown) {
                    yield session;
                }
            }
            const fn = SocketController.prototype.room as Function;
            expect(() => resolveParameters(SocketController.prototype, 'room', fn)).toThrow(
                /not available for that mapping kind/
            );
        });
    });
});

describe('fileValue() multipart extractor', () => {
    it('creates a MULTIPART_FILE extractor with an optional explicit part name', () => {
        expect(fileValue().type).toEqual(MethodParameterType.MULTIPART_FILE);
        const explicit = fileValue('avatar_url');
        expect(explicit.type).toEqual(MethodParameterType.MULTIPART_FILE);
        expect(explicit.partName).toBe('avatar_url');
    });

    it('folds the explicit part name into parameter.name (fileValue("field"))', () => {
        class UploadController {
            @routeMapping({ value: '/upload', method: 'POST' })
            @parameters({ profile: fileValue('avatar_url') })
            upload(profile: unknown) {}
        }
        const params = resolveParameters(
            UploadController.prototype,
            'upload',
            UploadController.prototype.upload as Function
        );
        expect(params[0].type).toEqual(MethodParameterType.MULTIPART_FILE);
        expect(params[0].name).toBe('avatar_url');
    });

    it('infers the part name from the argument name (fileValue())', () => {
        class UploadController {
            @routeMapping({ value: '/upload', method: 'POST' })
            @parameters({ avatar: fileValue() })
            upload(avatar: unknown) {}
        }
        const params = resolveParameters(
            UploadController.prototype,
            'upload',
            UploadController.prototype.upload as Function
        );
        expect(params[0].type).toEqual(MethodParameterType.MULTIPART_FILE);
        expect(params[0].name).toBe('avatar');
    });

    it('rejects fileValue() on a socket mapping at resolution time', () => {
        class SocketController {
            @socketMapping('/room')
            @parameters({ avatar: fileValue() })
            async *room(session: unknown) {
                yield session;
            }
        }
        const fn = SocketController.prototype.room as Function;
        expect(() => resolveParameters(SocketController.prototype, 'room', fn)).toThrow(
            /not available for that mapping kind/
        );
    });

    it('accepts a required option and threads it into the resolved parameter (DOC-5)', () => {
        expect(fileValue().required).toBe(false);
        expect(fileValue('avatar', { required: true }).required).toBe(true);

        class UploadController {
            @routeMapping({ value: '/upload', method: 'POST' })
            @parameters({ avatar: fileValue('avatar', { required: true }) })
            upload(avatar: unknown) {}
        }
        const params = resolveParameters(
            UploadController.prototype,
            'upload',
            UploadController.prototype.upload as Function
        );
        expect(params[0].type).toEqual(MethodParameterType.MULTIPART_FILE);
        expect(params[0].name).toBe('avatar');
        expect(params[0].required).toBe(true);
    });
});

describe('requestPart() multipart JSON-part extractor (D-6)', () => {
    it('creates a REQUEST_PART extractor with the part name inferred from the argument', () => {
        class UploadController {
            @routeMapping({ value: '/upload', method: 'POST' })
            @parameters({ meta: requestPart() })
            upload(meta: unknown) {}
        }
        const params = resolveParameters(
            UploadController.prototype,
            'upload',
            UploadController.prototype.upload as Function
        );
        expect(params[0].type).toEqual(MethodParameterType.REQUEST_PART);
        expect(params[0].name).toBe('meta');
        expect(params[0].target).toBeUndefined();
    });

    it('carries an explicit part name and a target constructor', () => {
        class MetaDTO {}
        const extractor = requestPart('meta', MetaDTO);
        expect(extractor.type).toEqual(MethodParameterType.REQUEST_PART);
        expect(extractor.partName).toBe('meta');
        expect(extractor.target).toBe(MetaDTO);
    });

    it('treats a lone constructor argument as the target (name inferred)', () => {
        class MetaDTO {}
        const extractor = requestPart(MetaDTO);
        expect(extractor.partName).toBeUndefined();
        expect(extractor.target).toBe(MetaDTO);
    });

    it('folds the explicit part name into parameter.name', () => {
        class UploadController {
            @routeMapping({ value: '/upload', method: 'POST' })
            @parameters({ meta: requestPart('metadata') })
            upload(meta: unknown) {}
        }
        const params = resolveParameters(
            UploadController.prototype,
            'upload',
            UploadController.prototype.upload as Function
        );
        expect(params[0].type).toEqual(MethodParameterType.REQUEST_PART);
        expect(params[0].name).toBe('metadata');
        expect(params[0].target).toBeUndefined();
    });

    it('rejects requestPart() on a socket mapping at resolution time', () => {
        class SocketController {
            @socketMapping('/room')
            @parameters({ meta: requestPart() })
            async *room(session: unknown) {
                yield session;
            }
        }
        const fn = SocketController.prototype.room as Function;
        expect(() => resolveParameters(SocketController.prototype, 'room', fn)).toThrow(
            /not available for that mapping kind/
        );
    });

    it('accepts a required option, with and without a target constructor (DOC-5)', () => {
        class MetaDTO {}
        expect(requestPart('meta').required).toBe(false);
        expect(requestPart('meta', undefined, { required: true }).required).toBe(true);
        expect(requestPart('meta', undefined, { required: true }).partName).toBe('meta');
        expect(requestPart(MetaDTO, { required: true }).required).toBe(true);
        expect(requestPart(MetaDTO, { required: true }).target).toBe(MetaDTO);
        expect(requestPart('meta', MetaDTO, { required: true }).required).toBe(true);
        expect(requestPart('meta', MetaDTO, { required: true }).target).toBe(MetaDTO);
    });
});

describe('RouteHandlerMethod fails fast on unserved parameter types (DSG-1)', () => {
    it('throws naming parameter and type when the resolver chain cannot serve a data-* source', () => {
        class DataController {
            @routeMapping('/users')
            @parameters({ user: dataBinderValue('body') })
            create(user: object) {}
        }
        const handler = new RouteHandlerMethod(new DataController(), 'create');
        handler.parameters = resolveParameters(
            DataController.prototype,
            'create',
            DataController.prototype.create as Function
        );
        // Empty chain: no resolver serves data-body:value — mirrors a
        // platform whose resolver set cannot bind a body source.
        handler.argumentResolvers = [];

        try {
            handler.invoke({} as never);
            expect.unreachable('invoke should throw');
        } catch (error) {
            expect(error).toBeInstanceOf(ParameterBindingError);
            expect(String(error)).toMatch(/No argument resolver supports data-body:value/);
            expect(String(error)).toMatch(/'body'/);
            expect(String(error)).toMatch(/'user'/);
        }
    });

    it('still binds parameters the resolver chain can serve', () => {
        class QueryController {
            @routeMapping('/q')
            @parameters({ page: queryValue('page') })
            handle(page: string) {
                return page;
            }
        }
        const handler = new RouteHandlerMethod(new QueryController(), 'handle');
        handler.parameters = resolveParameters(
            QueryController.prototype,
            'handle',
            QueryController.prototype.handle as Function
        );
        handler.argumentResolvers = [new QueryValueMethodArgumentResolver()];

        expect(handler.invoke({ data: { page: '42' }, attributes: {} } as never)).toBe('42');
    });
});
