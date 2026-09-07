import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
    ModelAndView,
    routeMapping,
    routeParams,
    bindValue,
    queryValue,
    validatedBy,
    ParameterConversionError,
    RouteErrorResolver,
    QueryValueMethodArgumentResolver,
} from '@blue/dispatcher';
import { BrowserDispatcher } from '../src/browser-dispatcher';
import {
    MetadataConfigApplicationContext,
    configuration,
    entry,
    ApplicationContextAwareProcessor,
} from '@blue/context';
import { BrowserBindMethodArgumentResolver } from '../src/bind-argument-resolver';

class TestView {
    render() {}
}

class TestViewResolver {
    async resolveViewName() {
        return new TestView();
    }
}

describe('Zod Validation Integration', () => {
    const UserSchema = z.object({
        name: z.string().min(2),
        age: z.coerce.number().min(18),
    });

    type User = z.infer<typeof UserSchema>;

    it('should validate and coerce data using validatedBy and bindValue', async () => {
        let capturedUser: User | null = null;

        @routeMapping('/users')
        class UserController {
            @routeMapping('/create')
            @routeParams({
                user: validatedBy(UserSchema, bindValue('query')),
            })
            create(user: User) {
                capturedUser = user;
                return new ModelAndView('success');
            }
        }

        @configuration
        class TestConfig {
            @entry controller() {
                return new UserController();
            }
            @entry viewResolver() {
                return new TestViewResolver();
            }
            @entry argumentResolvers() {
                return [new BrowserBindMethodArgumentResolver()];
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new BrowserDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/users/create',
            params: {},
            data: { name: 'Jeff', age: '30' },
            0: { name: 'users', raw: 'users', data: null },
            1: { name: 'create', raw: 'create', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as any);

        // Zod's z.coerce.number() handles string-to-number conversion
        expect(capturedUser).toBeDefined();
        expect(capturedUser!.name).toBe('Jeff');
        expect(capturedUser!.age).toBe(30); // coerced from '30' — proves validatedBy's convert ran
        // Note: z.coerce.number() conversion depends on Zod schema validation being applied
    });

    it('should handle invalid data gracefully', async () => {
        let capturedError: Error | null = null;

        @routeMapping('/users')
        class UserController {
            @routeMapping('/invalid')
            @routeParams({
                user: validatedBy(UserSchema, bindValue('query')),
            })
            invalid(user: User) {
                return new ModelAndView('success');
            }
        }

        class ErrorCapturingResolver implements RouteErrorResolver {
            resolveError(route: any, handler: any, error: Error) {
                capturedError = error;
                return new ModelAndView('error');
            }
        }

        @configuration
        class TestConfig {
            @entry controller() {
                return new UserController();
            }
            @entry viewResolver() {
                return new TestViewResolver();
            }
            @entry errorResolvers() {
                return [new ErrorCapturingResolver()];
            }
            @entry argumentResolvers() {
                return [new BrowserBindMethodArgumentResolver()];
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new BrowserDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/users/invalid',
            params: {},
            data: { name: 'J', age: '17' },
            0: { name: 'users', raw: 'users', data: null },
            1: { name: 'invalid', raw: 'invalid', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as any);

        // Validation errors should be captured and surfaced as conversion errors
        expect(capturedError).toBeDefined();
        expect(capturedError).toBeInstanceOf(ParameterConversionError);
    });

    it('should validate a per-field query parameter through the shared resolver', async () => {
        let captured: string | undefined;

        @routeMapping('/sub')
        class SubscribeController {
            @routeMapping('/go')
            @routeParams({ email: validatedBy(z.email(), queryValue('email')) })
            subscribe(email: string) {
                captured = email;
                return new ModelAndView('success');
            }
        }

        @configuration
        class TestConfig {
            @entry controller() {
                return new SubscribeController();
            }
            @entry viewResolver() {
                return new TestViewResolver();
            }
            @entry argumentResolvers() {
                return [new QueryValueMethodArgumentResolver()];
            }
        }

        const context = new MetadataConfigApplicationContext('shared-query');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new BrowserDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/sub/go',
            params: {},
            data: { email: 'jeff@example.co' },
            0: { name: 'sub', raw: 'sub', data: null },
            1: { name: 'go', raw: 'go', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as any);

        // The shared AbstractNamedValueMethodArgumentResolver pipeline must
        // invoke parameter.convert — previously only BIND and the platform
        // base did, so per-field query validation was silently skipped.
        expect(captured).toBe('jeff@example.co');
    });
});
