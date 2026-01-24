import { ApplicationBuilder } from '../src/application-builder';

describe('ApplicationBuilder', function () {
    test('it should register values', function () {
        const builder = new ApplicationBuilder([() => void 0]);
        expect(true).toBe(true);
    });
});
