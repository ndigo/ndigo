import { describe, test, expect, vi } from 'vitest';
import { EventModel } from '../src/event';

describe('Model', () => {
    test('it should assert', () => {
        const callback = vi.fn();

        const FooBar = EventModel({
            foo: Number,
            bar: Number,
        });

        const fb1 = new FooBar({
            foo: 12,
            bar: 34,
        });
        const fb2 = new FooBar({
            foo: 56,
            bar: 78,
        });

        fb1.on('change', callback);
        fb2.on('change:bar', callback);

        fb1.bar = 90;
        fb2.bar = 10;

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(34, 90);
        expect(callback).toHaveBeenCalledWith(78, 10);
    });
});
