/**
 * Context tokens for `@ndigo/http`.
 */
import { ContextToken } from '@ndigo/factory';
import type { HTTP } from './http-client';

/**
 * Token for the application's shared {@link HTTP} client entry. The Node and
 * web auto-configurations register a default client under it; apps override
 * the entry (e.g. to add interceptors or a custom fetch) and consumers resolve
 * it with `context.getValue(HTTP_CLIENT)` (or receive it via `HttpAware`).
 */
export const HTTP_CLIENT = new ContextToken<HTTP>('http');
