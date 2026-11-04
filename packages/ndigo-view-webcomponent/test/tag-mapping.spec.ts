/**
 * @module ndigo-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TagMapping } from '../src/tag-mapping.js';

// Mock customElements API. jsdom installs `customElements` on `window` as a
// getter-only accessor, so it is replaced through Vitest's global stub rather
// than by assignment (which throws on the jsdom global in Vitest 5).
const mockDefine = vi.fn();
vi.stubGlobal('customElements', { define: mockDefine });

describe('@tagMapping decorator (TC39)', () => {
    beforeEach(() => {
        mockDefine.mockClear();
    });

    describe('Basic functionality', () => {
        it('stores tag name on class', () => {
            @TagMapping('user-profile')
            class UserProfileElement extends HTMLElement {}

            expect(TagMapping.get(UserProfileElement)).toBe('user-profile');
        });

        it('calls customElements.define() with tag name and class', () => {
            @TagMapping('my-component')
            class MyComponent extends HTMLElement {}

            expect(mockDefine).toHaveBeenCalledWith('my-component', MyComponent);
            expect(mockDefine).toHaveBeenCalledTimes(1);
        });

        it('stores tag name accessible from instance', () => {
            @TagMapping('dashboard-widget')
            class DashboardWidget extends HTMLElement {}

            // Don't instantiate in jsdom - just verify the class has the metadata
            // and it would be accessible from an instance via constructor
            expect(TagMapping.get(DashboardWidget)).toBe('dashboard-widget');

            // Simulate instance access pattern (instance.constructor)
            const fakeInstance = Object.create(DashboardWidget.prototype);
            expect(TagMapping.get(fakeInstance)).toBe('dashboard-widget');
        });

        it('handles different tag names', () => {
            @TagMapping('login-form')
            class LoginForm extends HTMLElement {}

            @TagMapping('signup-form')
            class SignupForm extends HTMLElement {}

            expect(TagMapping.get(LoginForm)).toBe('login-form');
            expect(TagMapping.get(SignupForm)).toBe('signup-form');
        });
    });

    describe('Helper functions', () => {
        it('TagMapping.has() returns true when tag mapping exists', () => {
            @TagMapping('home-page')
            class HomePage extends HTMLElement {}

            expect(TagMapping.has(HomePage)).toBe(true);
        });

        it('TagMapping.has() returns false when tag mapping does not exist', () => {
            class PlainElement extends HTMLElement {}

            expect(TagMapping.has(PlainElement)).toBe(false);
        });

        it('TagMapping.define() manually sets tag name WITHOUT calling customElements.define()', () => {
            class ManualElement extends HTMLElement {}

            const callsBefore = mockDefine.mock.calls.length;

            TagMapping.define('manual-element', ManualElement);

            expect(TagMapping.get(ManualElement)).toBe('manual-element');
            expect(TagMapping.has(ManualElement)).toBe(true);
            // define() helper should NOT call customElements.define()
            expect(mockDefine.mock.calls.length).toBe(callsBefore);
        });

        it('TagMapping.delete() removes tag mapping', () => {
            @TagMapping('temp-element')
            class TempElement extends HTMLElement {}

            expect(TagMapping.has(TempElement)).toBe(true);

            TagMapping.delete(TempElement);

            expect(TagMapping.has(TempElement)).toBe(false);
            expect(TagMapping.get(TempElement)).toBeUndefined();
        });
    });

    describe('Edge cases', () => {
        it('handles empty string tag name', () => {
            @TagMapping('')
            class EmptyTag extends HTMLElement {}

            expect(TagMapping.get(EmptyTag)).toBe('');
            expect(mockDefine).toHaveBeenCalledWith('', EmptyTag);
        });

        it('preserves constructor and prototype', () => {
            @TagMapping('test-element')
            class TestElement extends HTMLElement {
                name = 'test';
                greet() {
                    return 'hello';
                }
            }

            // Verify metadata and structure without instantiation in jsdom
            expect(TagMapping.get(TestElement)).toBe('test-element');

            // Verify prototype chain is intact
            const fakeInstance = Object.create(TestElement.prototype);
            fakeInstance.name = 'test';
            expect(fakeInstance.name).toBe('test');
            expect(fakeInstance.greet()).toBe('hello');
            expect(fakeInstance.constructor).toBe(TestElement);
        });

        it('works with classes that extend other classes', () => {
            class BaseElement extends HTMLElement {
                baseMethod() {
                    return 'base';
                }
            }

            @TagMapping('extended-element')
            class ExtendedElement extends BaseElement {
                extendedMethod() {
                    return 'extended';
                }
            }

            // Verify metadata without instantiation in jsdom
            expect(TagMapping.get(ExtendedElement)).toBe('extended-element');

            // Verify prototype chain is intact
            const fakeInstance = Object.create(ExtendedElement.prototype);
            expect(fakeInstance.baseMethod()).toBe('base');
            expect(fakeInstance.extendedMethod()).toBe('extended');
        });

        it('last decorator wins when multiple applied (bottom-up execution)', () => {
            @TagMapping('second-element')
            @TagMapping('first-element')
            class MultiElement extends HTMLElement {}

            // TC39 decorators execute bottom-to-top, so 'first-element' is written first,
            // then 'second-element' overwrites it
            expect(TagMapping.get(MultiElement)).toBe('second-element');

            // customElements.define() should be called twice (once per decorator)
            expect(mockDefine).toHaveBeenCalledTimes(2);
            expect(mockDefine).toHaveBeenCalledWith('first-element', MultiElement);
            expect(mockDefine).toHaveBeenCalledWith('second-element', MultiElement);
        });
    });
});
