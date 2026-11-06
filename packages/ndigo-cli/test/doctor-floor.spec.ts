/**
 * Pins `doctor`'s Node floor to the root `engines` floor (issue #66).
 *
 * The two drifted once: `doctor` accepted Node 22 while `engine-strict`
 * refused to install there, so the diagnostic users are told to attach to
 * an issue report could pronounce a broken environment healthy. Parity is
 * therefore a failing test rather than a comment.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MIN_NODE_MAJOR } from '../src/commands/doctor';

/** The workspace-root manifest — this spec lives at `<root>/packages/blue-cli/test`. */
const ROOT_MANIFEST = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'package.json');

describe('doctor Node floor parity', () => {
    test('MIN_NODE_MAJOR matches the root engines.node floor', () => {
        const manifest = JSON.parse(readFileSync(ROOT_MANIFEST, 'utf8')) as { engines?: { node?: string } };
        const floor = /^>=\s*(\d+)/.exec(manifest.engines?.node ?? '');
        expect(floor?.[1]).toBe(String(MIN_NODE_MAJOR));
    });
});
