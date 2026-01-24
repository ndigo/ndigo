import { describe, test, afterEach, expect } from 'vitest';
import { Level } from '@blue/logger';
import { HTTPPostLayout } from '../../src/logger/http-post-layout';

describe('HTTPPostLayout', () => {
    test('it should be a function', () => {
        expect(HTTPPostLayout).toBeInstanceOf(Function);
    });

    test('it should make instances', () => {
        const layout = new HTTPPostLayout();
        expect(layout).toBeInstanceOf(HTTPPostLayout);
    });

    describe('instances', () => {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        let layout: HTTPPostLayout;

        afterEach(() => {
            layout = undefined as any;
        });

        test('it should format an entry', () => {
            layout = new HTTPPostLayout();
            expect(layout.format(entry)).toMatch(
                /category=layout.pattern.test.unit&level=ONE&message=This%20is%20a%20test&timestamp=819188640000/
            );
        });
    });
});
