/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { parseCommandLineArgs } from '../src/cli-arguments';

describe('parseCommandLineArgs', () => {
    test('should parse --key=value form', () => {
        expect(parseCommandLineArgs(['--server.port=9000', '--name=ndigo'])).toEqual({
            server: { port: '9000' },
            name: 'ndigo',
        });
    });

    test('should parse --key value space-separated form', () => {
        expect(parseCommandLineArgs(['--name', 'ndigo', '--port', '8080'])).toEqual({
            name: 'ndigo',
            port: '8080',
        });
    });

    test('should parse bare flags as true', () => {
        expect(parseCommandLineArgs(['--debug', '--verbose'])).toEqual({ debug: true, verbose: true });
    });

    test('a bare flag is not consumed by the next option', () => {
        expect(parseCommandLineArgs(['--debug', '--port=9000'])).toEqual({ debug: true, port: '9000' });
    });

    test('explicit values override bare flags and repeats are last-wins', () => {
        expect(parseCommandLineArgs(['--debug', '--debug=false', '--port', '1', '--port', '2'])).toEqual({
            debug: 'false',
            port: '2',
        });
    });

    test('-- terminator makes everything after positional (ignored)', () => {
        expect(parseCommandLineArgs(['--port=9000', '--', '--not-an-option', 'tail'])).toEqual({
            port: '9000',
        });
    });

    test('non-option positionals are ignored', () => {
        expect(parseCommandLineArgs(['config.json', '--port=9000', 'tail'])).toEqual({ port: '9000' });
    });

    test('empty string value is preserved', () => {
        expect(parseCommandLineArgs(['--name='])).toEqual({ name: '' });
    });

    test('empty args produce an empty map', () => {
        expect(parseCommandLineArgs([])).toEqual({});
    });
});
