/**
 */
import '@tsmetadata/polyfill';
import { describe, expect, it } from 'vitest';
import { ViewMapping } from '../src/view-mapping.js';

describe('@viewMapping decorator (TC39)', () => {
    describe('Basic functionality', () => {
        it('stores view name on class', () => {
            @ViewMapping('user-profile')
            class UserProfileView {}

            expect(ViewMapping.get(UserProfileView)).toBe('user-profile');
        });

        it('stores view name on instance', () => {
            @ViewMapping('dashboard')
            class DashboardView {}

            const instance = new DashboardView();
            expect(ViewMapping.get(instance)).toBe('dashboard');
        });

        it('handles different view names', () => {
            @ViewMapping('login-form')
            class LoginView {}

            @ViewMapping('signup-form')
            class SignupView {}

            expect(ViewMapping.get(LoginView)).toBe('login-form');
            expect(ViewMapping.get(SignupView)).toBe('signup-form');
        });
    });

    describe('Helper functions', () => {
        it('ViewMapping.has() returns true when view mapping exists', () => {
            @ViewMapping('home')
            class HomeView {}

            expect(ViewMapping.has(HomeView)).toBe(true);
        });

        it('ViewMapping.has() returns false when view mapping does not exist', () => {
            class PlainView {}

            expect(ViewMapping.has(PlainView)).toBe(false);
        });

        it('ViewMapping.define() manually sets view name', () => {
            class ManualView {}

            ViewMapping.define('manual-view', ManualView);

            expect(ViewMapping.get(ManualView)).toBe('manual-view');
            expect(ViewMapping.has(ManualView)).toBe(true);
        });

        it('ViewMapping.delete() removes view mapping', () => {
            @ViewMapping('temp-view')
            class TempView {}

            expect(ViewMapping.has(TempView)).toBe(true);

            ViewMapping.delete(TempView);

            expect(ViewMapping.has(TempView)).toBe(false);
            expect(ViewMapping.get(TempView)).toBeUndefined();
        });
    });

    describe('Edge cases', () => {
        it('handles empty string view name', () => {
            @ViewMapping('')
            class EmptyView {}

            expect(ViewMapping.get(EmptyView)).toBe('');
        });

        it('preserves constructor and prototype', () => {
            @ViewMapping('test-view')
            class TestView {
                name = 'test';
                greet() {
                    return 'hello';
                }
            }

            const instance = new TestView();
            expect(instance.name).toBe('test');
            expect(instance.greet()).toBe('hello');
            expect(instance.constructor).toBe(TestView);
        });

        it('works with classes that extend other classes', () => {
            class BaseView {
                baseMethod() {
                    return 'base';
                }
            }

            @ViewMapping('extended-view')
            class ExtendedView extends BaseView {
                extendedMethod() {
                    return 'extended';
                }
            }

            const instance = new ExtendedView();
            expect(ViewMapping.get(ExtendedView)).toBe('extended-view');
            expect(instance.baseMethod()).toBe('base');
            expect(instance.extendedMethod()).toBe('extended');
        });

        it('last decorator wins when multiple applied (bottom-up execution)', () => {
            @ViewMapping('second')
            @ViewMapping('first')
            class MultiView {}

            // TC39 decorators execute bottom-to-top, so 'first' is written first,
            // then 'second' overwrites it
            expect(ViewMapping.get(MultiView)).toBe('second');
        });
    });
});
