import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Route, RouteSegment } from '@blue/router';
import {
    routeMapping,
    routeParams,
    bodyValue,
    queryValue,
    validatedBy,
    ParameterConversionError,
    RouteErrorResolver,
} from '@blue/dispatcher';
import {
    MetadataConfigApplicationContext,
    configuration,
    entry,
} from '@blue/context';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeBodyValueMethodArgumentResolver } from '../src/body-argument-resolver';
import { NodeQueryValueMethodArgumentResolver } from '../src/query-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE } from '../src/node-request';

/**
 * Zod-backed request validation over the Node argument pipeline (AD-7).
 *
 * Regression: `validatedBy` attaches a `convert` hook to a parameter
 * extractor, but `AbstractPlatformArgumentResolver.resolveArgument` never
 * invoked it — only the browser BIND path did. These specs prove the hook
 * runs for the shared resolver pipeline (body, query, per-field, whole-body)
 * and that failures surface as `ParameterConversionError` through the
 * dispatcher's error resolver.
 */

type TestApp = { dispatcher: NodeDispatcher; context: MetadataConfigApplicationContext };
type ConfigClass = new () => object;

/** Build a fully-typed route for the Node dispatcher. */
const nodeRoute = (path: string, data: Record<string, unknown>, attributes: Record<string, unknown>, segments: string[]): Route => {
    const route: Route = {
        path,
        raw: path,
        data,
        params: null,
        id: 1,
        attributes,
        length: segments.length,
    };
    for (let index = 0; index < segments.length; index++) {
        const segment: RouteSegment = { name: segments[index], data: {} };
        route[index] = segment;
    }
    return route;
};

const bodyRequest = (body: Record<string, unknown>): Record<string, unknown> => ({
    [NODE_REQUEST_ATTRIBUTE]: { headers: {}, body, cookies: {}, session: {} },
});

/** Boot a Node dispatcher from a config class, mirroring the app wiring. */
async function boot(configClass: ConfigClass): Promise<TestApp> {
    const context = new MetadataConfigApplicationContext('zod-node');
    context.register(configClass);

    const dispatcher = new NodeDispatcher();
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    return { dispatcher, context };
}

const dispatcherConfig = (
    controller: ConfigClass,
    errorResolvers: RouteErrorResolver[] = []
): ConfigClass => {
    @configuration
    class C {
        @entry controller() {
            return new controller();
        }
        @entry argumentResolvers() {
            return [new NodeBodyValueMethodArgumentResolver(), new NodeQueryValueMethodArgumentResolver()];
        }
        @entry errorResolvers() {
            return errorResolvers;
        }
    }
    return C;
};

describe('Zod validation over the Node argument pipeline', () => {
    const UserSchema = z.object({
        name: z.string().min(2),
        age: z.coerce.number().min(18),
    });
    const EmailSchema = z.email();
    const TitleSchema = z.string().min(3);
    type User = z.infer<typeof UserSchema>;

    it('validates and coerces a whole-body object via validatedBy + bodyValue("*")', async () => {
        let captured: User | null = null;

        @routeMapping('/notes')
        class NotesController {
            @routeMapping('/create')
            @routeParams({ data: validatedBy(UserSchema, bodyValue('*')) })
            create(data: User) {
                captured = data;
                return { ok: true };
            }
        }

        const app = await boot(dispatcherConfig(NotesController));
        const route = nodeRoute('/notes/create', {}, bodyRequest({ name: 'Jeff', age: '30' }), ['notes', 'create']);

        await app.dispatcher.dispatch(route);

        // z.coerce.number() ran after binding — proves validatedBy's convert hook fired.
        expect(captured).toBeDefined();
        expect(captured!.name).toBe('Jeff');
        expect(captured!.age).toBe(30);
    });

    it('validates a per-field query parameter', async () => {
        let captured: string | undefined;

        @routeMapping('/subscribe')
        class SubscribeController {
            @routeMapping('/')
            @routeParams({ email: validatedBy(EmailSchema, queryValue('email')) })
            subscribe(email: string) {
                captured = email;
                return { ok: true };
            }
        }

        const app = await boot(dispatcherConfig(SubscribeController));
        const route = nodeRoute('/subscribe/', { email: 'jeff@example.co' }, bodyRequest({}), ['subscribe', '']);

        await app.dispatcher.dispatch(route);

        expect(captured).toBe('jeff@example.co');
    });

    it('validates a per-field body parameter', async () => {
        let captured: string | undefined;

        @routeMapping('/todos')
        class TodosController {
            @routeMapping('/create')
            @routeParams({ title: validatedBy(TitleSchema, bodyValue('title')) })
            create(title: string) {
                captured = title;
                return { ok: true };
            }
        }

        const app = await boot(dispatcherConfig(TodosController));
        const route = nodeRoute('/todos/create', {}, bodyRequest({ title: 'Build validation' }), ['todos', 'create']);

        await app.dispatcher.dispatch(route);

        expect(captured).toBe('Build validation');
    });

    it('surfaces an invalid whole-body object as a ParameterConversionError', async () => {
        let capturedError: Error | null = null;

        class ErrorCapturingResolver implements RouteErrorResolver {
            resolveError(route: Route, handler: object | null, error: Error) {
                capturedError = error;
                return null;
            }
        }

        @routeMapping('/notes')
        class NotesController {
            @routeMapping('/create')
            @routeParams({ data: validatedBy(UserSchema, bodyValue('*')) })
            create(data: User) {
                return { ok: true };
            }
        }

        const app = await boot(dispatcherConfig(NotesController, [new ErrorCapturingResolver()]));
        const route = nodeRoute('/notes/create', {}, bodyRequest({ name: 'J', age: '17' }), ['notes', 'create']);

        await app.dispatcher.dispatch(route);

        expect(capturedError).toBeDefined();
        expect(capturedError).toBeInstanceOf(ParameterConversionError);
    });

    it('surfaces an invalid per-field value as a ParameterConversionError', async () => {
        let capturedError: Error | null = null;

        class ErrorCapturingResolver implements RouteErrorResolver {
            resolveError(route: Route, handler: object | null, error: Error) {
                capturedError = error;
                return null;
            }
        }

        @routeMapping('/subscribe')
        class SubscribeController {
            @routeMapping('/')
            @routeParams({ email: validatedBy(EmailSchema, queryValue('email')) })
            subscribe(email: string) {
                return { ok: true };
            }
        }

        const app = await boot(dispatcherConfig(SubscribeController, [new ErrorCapturingResolver()]));
        const route = nodeRoute('/subscribe/', { email: 'definitely-not-an-email' }, bodyRequest({}), ['subscribe', '']);

        await app.dispatcher.dispatch(route);

        expect(capturedError).toBeDefined();
        expect(capturedError).toBeInstanceOf(ParameterConversionError);
    });
});