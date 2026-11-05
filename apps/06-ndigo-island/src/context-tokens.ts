/**
 * App-local type-safe bean handles (AD-34 D1).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/context';
import type { I18nextMessageSource } from '@ndigo/content-i18next';
import type { TodoModelStore } from './todo-model-store';

/**
 * Token for the application message source entry.
 */
export const MESSAGE_SOURCE = new ContextToken<I18nextMessageSource>('messageSource');

/**
 * Token for the reactive todo model store entry.
 */
export const MODEL_STORE = new ContextToken<TodoModelStore>('modelStore');
