import { Application } from '../src/application';

describe('Application', function () {
    test('it should create instances', function () {
        const app = new Application('hello-world', [() => void 0]);
        expect(true).toBe(true);
    });
});
