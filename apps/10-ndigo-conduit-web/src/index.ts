/**
 * Browser entry point for `@ndigo/conduit-web`.
 *
 * Loads the decorator-metadata polyfill (the framework's `@routeMapping`,
 * `@entry` and `@TagMapping` decorators read `Symbol.metadata`), registers every
 * view component by importing it, then boots the runtime. The view imports are
 * side effects: `@TagMapping` performs the `customElements.define` at module
 * load, and the dispatcher resolves a view name to that tag, so a component that
 * is never imported renders as an unknown element.
 */
import '@tsmetadata/polyfill';
import { composeConduitRuntime, createConduitContext } from './app/conduit-runtime';
import './views/article-view';
import './views/auth-view';
import './views/conduit-nav';
import './views/editor-view';
import './views/home-view';
import './views/profile-view';
import './views/settings-view';

const runtime = await composeConduitRuntime(await createConduitContext());

export default runtime;
