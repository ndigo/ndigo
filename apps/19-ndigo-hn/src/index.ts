/**
 * Browser entry point for `@ndigo/hn`.
 *
 * Loads the decorator-metadata polyfill (the framework's `@routeMapping` and
 * `@TagMapping` decorators read `Symbol.metadata`), starts browser telemetry,
 * registers every view component by importing it, then boots the runtime. The
 * view imports are side effects: `@TagMapping` performs the `customElements.define`
 * at module load, and the dispatcher resolves a view name (which is the tag
 * name) to that element, so a component that is never imported renders as an
 * unknown element.
 */
import '@tsmetadata/polyfill';
import './telemetry-setup';
import './views/hn-item';
import './views/hn-list';
import { composeHnRuntime } from './app/hn-runtime';

const runtime = await composeHnRuntime();

export default runtime;
