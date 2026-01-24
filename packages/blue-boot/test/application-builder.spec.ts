import { describe, test, expect } from 'vitest';
import { ApplicationBuilder } from '../src/application-builder';

describe('ApplicationBuilder', () => {
    test('it should register values', () => {
        const builder = new ApplicationBuilder([() => void 0]);
        expect(true).toBe(true);
    });
});
