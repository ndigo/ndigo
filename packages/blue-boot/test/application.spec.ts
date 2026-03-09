import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';

describe('Application', () => {
    test('it should create instances', () => {
        const app = new Application([() => void 0]);
        expect(app).toBeInstanceOf(Application);
    });

    test('it should run and refresh context', () => {
        const app = new Application([() => void 0]);
        const context = app.run();

        expect(context.isActive).toBe(true);
    });
});
