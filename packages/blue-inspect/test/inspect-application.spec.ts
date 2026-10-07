/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { GenericApplicationContext, type ApplicationContext } from '@blue/context';
import {
    RadixMetadataHandlerMapping,
    parameters,
    pathVariable,
    requestMapping,
    routeMapping,
    socketMapping,
} from '@blue/dispatcher';
import { RouteRegistry } from '@blue/router';
import { configurationProperties } from '@blue/boot';
import { property } from '@blue/context';
import { inspectApplication } from '../src/index';

const FIXED_NOW = '2020-01-01T00:00:00.000Z';

@routeMapping('/api')
class DemoController {
    @requestMapping({ value: '/items/{id}', method: 'GET', private: false })
    @parameters({ id: pathVariable('id') })
    item(id: string) {
        return id;
    }

    @requestMapping({ value: '/items', method: 'POST', private: false })
    create() {
        return 'ok';
    }

    @socketMapping('/chat')
    chat() {
        return 'ok';
    }
}

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) port!: number;
    @property('host') host!: string;
}

/**
 * A minimal `ApplicationContext` stub: the manifest reads only `name`,
 * `environment.activeProfiles`, and the environment's presence/origin probes.
 */
function contextWith(properties: Record<string, string> = {}): ApplicationContext {
    return {
        name: 'test-app',
        environment: {
            activeProfiles: ['dev'],
            getProperty: (key: string) => properties[key],
            originOf: (key: string) => (key in properties ? 'boot' : null),
        },
    } as unknown as ApplicationContext;
}

function buildMapping(): RadixMetadataHandlerMapping {
    const ctx = new GenericApplicationContext('inspect-mapping');
    ctx.setValue('demoController', new DemoController());
    const mapping = new RadixMetadataHandlerMapping();
    mapping.setApplicationContext(ctx);
    mapping.init();
    return mapping;
}

describe('inspectApplication', () => {
    test('emits a versioned manifest with a pinned timestamp and app identity', () => {
        const manifest = inspectApplication({ context: contextWith(), now: FIXED_NOW });

        expect(manifest.version).toBe(1);
        expect(manifest.generatedAt).toBe(FIXED_NOW);
        expect(manifest.app).toEqual({ name: 'test-app', profiles: ['dev'] });
        expect(manifest.routes).toEqual([]);
        expect(manifest.mappings).toEqual([]);
        expect(manifest.config).toEqual([]);
    });

    test('defaults generatedAt to the current ISO time when now is not injected', () => {
        const manifest = inspectApplication({ context: contextWith() });

        expect(Number.isNaN(Date.parse(manifest.generatedAt))).toBe(false);
    });

    test('enumerates and sorts routes from a RouteRegistry', () => {
        const registry = new RouteRegistry();
        registry.scanSources([DemoController], new GenericApplicationContext('routes'));

        const manifest = inspectApplication({ context: contextWith(), routes: registry, now: FIXED_NOW });

        expect(manifest.routes).toEqual([
            { name: 'api.byId', path: '/api/items/{id}' },
            { name: 'api.chat', path: '/api/chat' },
            { name: 'api.items', path: '/api/items' },
        ]);
    });

    test('accepts explicit route descriptors with a partition and sorts them', () => {
        const manifest = inspectApplication({
            context: contextWith(),
            routes: [
                { name: 'b', path: '/b' },
                { name: 'a', path: '/a', partition: 'shell' },
            ],
            now: FIXED_NOW,
        });

        expect(manifest.routes).toEqual([
            { name: 'a', path: '/a', partition: 'shell' },
            { name: 'b', path: '/b' },
        ]);
    });

    test('enumerates mappings through the dispatcher read model (pattern, methods, handler, parameters)', () => {
        const manifest = inspectApplication({
            context: contextWith(),
            mappings: buildMapping(),
            now: FIXED_NOW,
        });

        expect(manifest.mappings).toEqual([
            {
                pattern: '/api/chat',
                socket: true,
                handler: { class: 'DemoController', method: 'chat' },
            },
            {
                pattern: '/api/items',
                httpMethods: ['POST'],
                handler: { class: 'DemoController', method: 'create' },
            },
            {
                pattern: '/api/items/{id}',
                httpMethods: ['GET'],
                handler: { class: 'DemoController', method: 'item' },
                parameters: [{ name: 'id', source: 'path:variable' }],
            },
        ]);
    });

    test('accepts a dispatcher-like source carrying handlerMappings', () => {
        const mapping = buildMapping();

        const manifest = inspectApplication({
            context: contextWith(),
            mappings: { handlerMappings: [mapping] },
            now: FIXED_NOW,
        });

        expect(manifest.mappings).toHaveLength(3);
    });

    test('emits sorted declared config keys with presence and origin but never values', () => {
        const secret = 'super-secret-value';
        const manifest = inspectApplication({
            context: contextWith({ 'server.port': secret }),
            configurationClasses: [ServerConfig],
            now: FIXED_NOW,
        });

        expect(manifest.config).toEqual([
            { key: 'server.host', hasValue: false },
            { key: 'server.port', type: 'number', origin: 'boot', hasValue: true },
        ]);
        for (const entry of manifest.config) {
            expect(Object.keys(entry)).not.toContain('value');
        }
        expect(JSON.stringify(manifest)).not.toContain(secret);
    });
});
