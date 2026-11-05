/**
 * `@whenFeature` decoration-time contract (AD-82 D-4): method and class
 * metadata keys, decoration-time key validation, and the reader.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { getWhenFeature, whenFeature } from '../src/when-feature';

describe('whenFeature', () => {
    test('stores method-level metadata under the method key', () => {
        class Controller {
            @whenFeature('todo.dueDates')
            due() {
                return 'due';
            }
        }
        expect(getWhenFeature(Controller.prototype, 'due')).toBe('todo.dueDates');
        expect(getWhenFeature(Controller.prototype, 'other')).toBeUndefined();
    });

    test('stores class-level metadata under the class key', () => {
        @whenFeature('beta.ui')
        class BetaController {}
        expect(getWhenFeature(BetaController)).toBe('beta.ui');
    });

    test('reads an instance through the prototype chain', () => {
        class Controller {
            @whenFeature('checkout')
            pay() {
                return 'ok';
            }
        }
        expect(getWhenFeature(new Controller(), 'pay')).toBe('checkout');
    });

    test('rejects invalid flag keys at decoration time', () => {
        expect(() => {
            class Bad {
                @whenFeature('bad key')
                method() {}
            }
        }).toThrow(TypeError);
    });

    test('rejects non-class/method decorator kinds', () => {
        const decorator = whenFeature('x');
        const fieldContext = {
            kind: 'field',
            name: 'field',
            metadata: {},
        } as unknown as ClassDecoratorContext | ClassMethodDecoratorContext;
        expect(() => decorator(undefined, fieldContext)).toThrow(TypeError);
    });
});
