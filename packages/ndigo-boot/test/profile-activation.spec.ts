/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, afterEach } from 'vitest';
import { StandardEnvironment } from '@ndigo/context';
import { Application } from '../src/application';

class EmptyConfiguration {}

describe('Environment profile defaults (AD-14 D1)', () => {
    test('defaults activate when no explicit profile is set', () => {
        const env = new StandardEnvironment();
        env.addDefaultProfile('prod');

        expect(env.activeProfilesOrDefaults).toEqual(['prod']);
        expect(env.acceptsProfiles('prod')).toBe(true);
        expect(env.acceptsProfiles('dev')).toBe(false);
    });

    test('defaults are ignored when explicit profiles exist', () => {
        const env = new StandardEnvironment();
        env.addActiveProfile('dev');
        env.addDefaultProfile('prod');

        expect(env.activeProfiles).toEqual(['dev']);
        expect(env.activeProfilesOrDefaults).toEqual(['dev']);
        expect(env.acceptsProfiles('prod')).toBe(false);
        expect(env.acceptsProfiles('dev')).toBe(true);
    });

    test('acceptsProfiles evaluates expressions against the effective set', () => {
        const env = new StandardEnvironment();
        env.addDefaultProfile('prod');

        expect(env.acceptsProfiles('!dev')).toBe(true);
        expect(env.acceptsProfiles('prod & !staging')).toBe(true);
        expect(env.acceptsProfiles('(test | staging)')).toBe(false);
    });
});

describe('Application profile activation (AD-14 D3/D4)', () => {
    const cleanEnv = () => {
        delete process.env.NDIGO_PROFILES_ACTIVE;
        delete process.env.NDIGO_PROFILES_DEFAULT;
        delete process.env.NDIGO_PROFILES_GROUPS;
    };
    afterEach(cleanEnv);

    test('env NDIGO_PROFILES_ACTIVE activates profiles', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_ACTIVE = 'prod';
        const app = new Application([EmptyConfiguration]);

        const context = await app.run();
        expect(context.environment?.activeProfiles).toEqual(['prod']);
    });

    test('CLI --profiles.active beats env and builder', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_ACTIVE = 'env-profile';
        const app = new Application([EmptyConfiguration]);
        app.setProfiles('builder-profile');

        const context = await app.run('--profiles.active=cli-profile');
        expect(context.environment?.activeProfiles).toEqual(['cli-profile']);
    });

    test('env beats builder when no CLI', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_ACTIVE = 'env-profile';
        const app = new Application([EmptyConfiguration]);
        app.setProfiles('builder-profile');

        const context = await app.run();
        expect(context.environment?.activeProfiles).toEqual(['env-profile']);
    });

    test('builder profiles apply when no env or CLI', async () => {
        cleanEnv();
        const app = new Application([EmptyConfiguration]);
        app.setProfiles('builder-profile');

        const context = await app.run();
        expect(context.environment?.activeProfiles).toEqual(['builder-profile']);
    });

    test('NDIGO_PROFILES_DEFAULT sets the default set (used when nothing active)', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_DEFAULT = 'base';
        const app = new Application([EmptyConfiguration]);

        const context = await app.run();
        expect(context.environment?.defaultProfiles).toEqual(['base']);
        expect(context.environment?.acceptsProfiles('base')).toBe(true);
    });

    test('profile groups expand on activation', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_ACTIVE = 'short';
        process.env.NDIGO_PROFILES_GROUPS = 'short=dev,test';

        const app = new Application([EmptyConfiguration]);

        const context = await app.run();
        expect(context.environment?.activeProfiles).toEqual(['short', 'dev', 'test']);
    });

    test('CLI group mapping expands too', async () => {
        cleanEnv();
        const app = new Application([EmptyConfiguration]);

        const context = await app.run('--profiles.active=short', '--profiles.group.short=dev,test');
        expect(context.environment?.activeProfiles).toEqual(['short', 'dev', 'test']);
    });

    test('CTX-12: CLI group mapping overrides an env group of the same name', async () => {
        cleanEnv();
        process.env.NDIGO_PROFILES_ACTIVE = 'short';
        process.env.NDIGO_PROFILES_GROUPS = 'short=env-a,env-b';
        const app = new Application([EmptyConfiguration]);

        // Env groups are the deployment baseline; CLI is the most specific and
        // lands last. Before the fix NDIGO_PROFILES_GROUPS overwrote the CLI map.
        const context = await app.run('--profiles.group.short=cli-x');
        expect(context.environment?.activeProfiles).toEqual(['short', 'cli-x']);
    });
});
