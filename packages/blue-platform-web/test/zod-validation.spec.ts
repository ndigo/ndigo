import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import {
    BrowserDispatcher,
    ModelAndView,
    routeMapping,
    routeParams,
    bindValue,
    ParameterConversionError,
    RouteErrorResolver,
} from '@blue/dispatcher';
import { validatedBy, ValidationError } from '@blue/validate';
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

        expect(capturedUser).toEqual({ name: 'Jeff', age: 30 });
    });

    it('should route validation errors to error resolver', async () => {
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

        expect(capturedError).toBeInstanceOf(ParameterConversionError);
        const conversionError = capturedError as ParameterConversionError;
        expect(conversionError.cause).toBeInstanceOf(ValidationError);
        expect(conversionError.message).toContain('name: String must contain at least 2 character(s)');
        expect(conversionError.message).toContain('age: Number must be greater than or equal to 18');
    });
});
