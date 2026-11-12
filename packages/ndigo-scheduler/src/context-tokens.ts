/**
 * Type-safe entry handles for the ndigo-scheduler contracts (AD-34 D1).
 */
import { ContextToken } from '@ndigo/factory';
import type { TaskScheduler } from './task-scheduler';

/**
 * Token for the node platform's {@link TaskScheduler} entry. The node
 * auto-configuration registers the `taskScheduler()` entry;
 * consumers resolve it with `context.getValue(TASK_SCHEDULER)`.
 */
export const TASK_SCHEDULER = new ContextToken<TaskScheduler>('taskScheduler');
