/**
 * The fixture's `scripts.inspect` entry: boot the same assembly the generated
 * stdio entry uses and print the manifest as JSON.
 */
import 'node:process';
import '@tsmetadata/polyfill';
import { ApplicationBuilder } from '@ndigo/boot';
import { DISPATCHER } from '@ndigo/dispatcher';
import { inspectApplication } from '@ndigo/inspect';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { FixtureConfiguration } from './app-configuration';
// The fixture adopts the wave-1 capabilities: `ndigo add` writes these
// modules before anything boots in this spec, and registering them makes
// `app-boot` exercise the applied wiring, not just the untouched app.
import { CacheConfiguration } from './cache';

const context = await new ApplicationBuilder([NodeAutoConfiguration, FixtureConfiguration, CacheConfiguration]).run();
const manifest = inspectApplication({ context, mappings: context.getValue(DISPATCHER) });
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
context.close();
