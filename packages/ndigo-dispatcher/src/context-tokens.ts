/**
 * Context tokens for dispatcher services.
 */

import { ContextToken } from '@ndigo/factory';
import type { AbstractDispatcher } from './dispatcher';
import type { HandlerMethodArgumentResolver } from './argument-resolver';
import type { RadixMetadataHandlerMapping } from './radix-metadata-handler-mapping';
import type { ViewTarget } from '@ndigo/view';

/**
 * Context token for the {@link AbstractDispatcher}.
 */
export const DISPATCHER = new ContextToken<AbstractDispatcher>('dispatcher');

/**
 * Context token for the metadata handler mapping entry.
 */
export const HANDLER_MAPPING = new ContextToken<RadixMetadataHandlerMapping>('handlerMapping');

/**
 * Context token for the application's view target entry (rendered view output).
 */
export const VIEW_TARGET = new ContextToken<ViewTarget>('viewTarget');

/**
 * Route attribute key under which a handler or interceptor may place a
 * per-dispatch {@link ViewTarget}.
 *
 * The value must be a target instance, never a selector string: route
 * attributes can carry request-derived data, and the dispatcher validates the
 * value with `likeViewTarget` before a view writes into it.
 */
export const VIEW_TARGET_ATTRIBUTE = '__dispatch:viewTarget';

/**
 * Context token for the argument-resolver collection entry (AD-34 D1).
 */
export const ARGUMENT_RESOLVERS = new ContextToken<HandlerMethodArgumentResolver[]>('argumentResolvers');

/**
 * Context token for a single stand-alone argument-resolver entry.
 */
export const ARGUMENT_RESOLVER = new ContextToken<HandlerMethodArgumentResolver>('argumentResolver');
