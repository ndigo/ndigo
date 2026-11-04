/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeAll } from 'vitest';

// Mock location object for browser-specific code
beforeAll(() => {
    if (typeof location === 'undefined') {
        (globalThis as unknown as { location?: unknown }).location = {
            href: 'http://localhost:3000/',
            origin: 'http://localhost',
            protocol: 'http:',
            host: 'localhost',
            hostname: 'localhost',
            port: '',
            pathname: '/',
            search: '',
            hash: '',
        };
    }
});
