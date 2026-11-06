/**
 */
import { ContextToken } from '@ndigo/context';
import { DISPATCHER } from '@ndigo/dispatcher';
import { ROUTER } from '@ndigo/router';
import type { RouteRegistry } from '@ndigo/router';
import type TodoService from './todo-service';

export { DISPATCHER, ROUTER };
export const TODO_SERVICE = new ContextToken<TodoService>('todoService');
export const ROUTE_REGISTRY = new ContextToken<RouteRegistry>('routeRegistry');
