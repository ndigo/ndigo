/**
 * App-local type-safe entry handles (AD-34 D1).
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
