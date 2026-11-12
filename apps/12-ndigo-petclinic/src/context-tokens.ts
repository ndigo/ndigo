/**
 * App-local type-safe entry handles (AD-34 D1).
 */
import { ContextToken } from '@ndigo/context';
import type { I18nextMessageSource } from '@ndigo/content-i18next';

/**
 * Token for the application message source entry — the entry the bootstrap
 * installs on the context (`context.setMessageSource(...)`) so the EJS locale
 * helpers can resolve `t('...')` for the request's negotiated language.
 */
export const MESSAGE_SOURCE = new ContextToken<I18nextMessageSource>('messageSource');
