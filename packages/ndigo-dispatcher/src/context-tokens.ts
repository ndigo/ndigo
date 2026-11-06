/**
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
 * Context token for the metadata handler mapping bean.
 */
export const HANDLER_MAPPING = new ContextToken<RadixMetadataHandlerMapping>('handlerMapping');

/**
 * Context token for the application's view target bean (rendered view output).
 */
export const VIEW_TARGET = new ContextToken<ViewTarget>('viewTarget');

/**
 * Context token for the argument-resolver collection bean (AD-34 D1).
 */
export const ARGUMENT_RESOLVERS = new ContextToken<HandlerMethodArgumentResolver[]>('argumentResolvers');

/**
 * Context token for a single stand-alone argument-resolver bean.
 */
export const ARGUMENT_RESOLVER = new ContextToken<HandlerMethodArgumentResolver>('argumentResolver');
