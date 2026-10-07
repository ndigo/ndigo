/**
 * App-local type-safe bean handles (AD-34 D1).
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/context';
import type { I18nextMessageSource } from '@blue/content-i18next';

/**
 * Token for the application message source entry — the bean the bootstrap
 * installs on the context (`context.setMessageSource(...)`) so the EJS locale
 * helpers can resolve `t('...')` for the request's negotiated language.
 */
export const MESSAGE_SOURCE = new ContextToken<I18nextMessageSource>('messageSource');
