/**
 * Unit spec for the `ndigo new` argv seam (AD-85): only flags the `app`
 * generator's schema declares are forwarded, and `--dry-run` appears only
 * when requested.
 */
import { describe, expect, test } from 'vitest';
import { newAppArgv } from '../src/commands/new';

describe('ndigo new argv', () => {
    test('always carries --name and nothing else by default', () => {
        expect(newAppArgv('widget', {})).toEqual(['--name', 'widget']);
    });

    test('forwards kind, number, port, and description', () => {
        expect(newAppArgv('widget', { kind: 'node', number: 20, port: 3120, description: 'A demo' })).toEqual([
            '--name',
            'widget',
            '--kind',
            'node',
            '--number',
            '20',
            '--port',
            '3120',
            '--description',
            'A demo',
        ]);
    });

    test('adds --dry-run only when requested', () => {
        expect(newAppArgv('widget', { kind: 'browser', dryRun: true })).toEqual([
            '--name',
            'widget',
            '--kind',
            'browser',
            '--dry-run',
        ]);
        expect(newAppArgv('widget', { kind: 'browser', dryRun: false })).not.toContain('--dry-run');
    });
});
