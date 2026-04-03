import { ContextToken } from '@blue/context';
import { DISPATCHER } from '@blue/dispatcher';
import { ROUTER } from '@blue/router';
import type TodoService from './todo-service';
import type NotesService from './notes-service';

export { DISPATCHER, ROUTER };
export const TODO_SERVICE = new ContextToken<TodoService>('todoService');
export const NOTES_SERVICE = new ContextToken<NotesService>('notesService');
