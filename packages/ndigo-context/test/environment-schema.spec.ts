/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { StandardEnvironment } from '../src/environment';
import { environment, validateEnvironment, getEnvironmentSchema } from '../src/environment-schema';

const serverSchema = z.object({
    server: z
        .object({
            port: z.coerce.number().min(1),
            host: z.string(),
        })
        .optional(),
    mode: z.string().optional(),
});

describe('@environment decorator (AD-17 D1)', () => {
    test('stores the schema in class metadata', () => {
        @environment(serverSchema)
        class AppConfig {}

        expect(getEnvironmentSchema(AppConfig)).toBe(serverSchema);
    });

    test('returns undefined for undecorated classes', () => {
        class Plain {}
        expect(getEnvironmentSchema(Plain)).toBeUndefined();
    });
});

describe('validateEnvironment (AD-17 D2)', () => {
    test('valid environment resolves clean', () => {
        const env = new StandardEnvironment([{ server: { port: '8080', host: 'ndigo.dev' }, mode: 'prod' }]);
        const result = validateEnvironment(env, serverSchema);

        expect(result.valid).toBe(true);
        expect(result.issues).toEqual([]);
    });

    test('reports every violation as an aggregate (path, expected, actual)', () => {
        const env = new StandardEnvironment([{ server: { port: 'not-a-number', host: '' }, mode: 42 }]);
        const result = validateEnvironment(env, serverSchema);

        expect(result.valid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
        // Aggregate: multiple independent issues surface together.
        expect(result.issues.some((issue) => issue.path.startsWith('server.port'))).toBe(true);
        expect(result.issues.some((issue) => issue.path.startsWith('mode'))).toBe(true);
        // Actual value is reported raw.
        const portIssue = result.issues.find((issue) => issue.path.startsWith('server.port'));
        expect(portIssue?.actual).toBe('not-a-number');
    });

    test('clean environment is unchanged after validation (report-only, no coercion)', () => {
        const env = new StandardEnvironment([{ server: { port: '8080' } }]);
        validateEnvironment(env, serverSchema);
        expect(env.getProperty('server.port')).toBe('8080'); // string untouched
    });

    test('non-object schemas fail loud', () => {
        const env = new StandardEnvironment([]);
        expect(() => validateEnvironment(env, z.string())).toThrowError(/object schema/);
    });

    test('missing top-level keys report as issues', () => {
        const env = new StandardEnvironment([]);
        const result = validateEnvironment(env, z.object({ server: z.object({ port: z.number() }).required() }));

        expect(result.valid).toBe(false);
        const issue = result.issues.find((i) => i.path.startsWith('server'));
        expect(issue?.actual).toBeUndefined();
    });
});
