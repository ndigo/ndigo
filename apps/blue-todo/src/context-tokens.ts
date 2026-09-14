/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/context';
import { DISPATCHER } from '@blue/dispatcher';
import { ROUTER } from '@blue/router';
import type TodoService from './todo-service';

export { DISPATCHER, ROUTER };
export const TODO_SERVICE = new ContextToken<TodoService>('todoService');
