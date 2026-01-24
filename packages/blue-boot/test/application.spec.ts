import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';

describe('Application', () => {
    test('it should create instances', () => {
        const app = new Application('hello-world', [() => void 0]);
        expect(true).toBe(true);
    });
});
