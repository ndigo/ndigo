/**
 * The context tokens this app's beans are registered and looked up under.
 *
 * Every read goes through a token, never a string: the token carries the bean's
 * compile-time type to the call site, so `context.getValue(HN_SERVICE)` is an
 * `HnService` at the type level and a rename cannot silently miss.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/context';
import { DISPATCHER, HANDLER_MAPPING, VIEW_TARGET } from '@blue/dispatcher';
import { ROUTER } from '@blue/router';
import type { HNAPI } from '../api/hn-api';
import type { HnService } from '../services/hn-service';

export { DISPATCHER, HANDLER_MAPPING, ROUTER, VIEW_TARGET };

/** The reader's state service. */
export const HN_SERVICE = new ContextToken<HnService>('hnService');

/** The HN data port (the HTTP-backed client in the running app). */
export const HN_API = new ContextToken<HNAPI>('hnApi');
