/**
 * Type-safe bean handles for the ndigo-scheduler contracts (AD-34 D1).
 * @module ndigo-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/factory';
import type { TaskScheduler } from './task-scheduler';

/**
 * Token for the node platform's {@link TaskScheduler} bean. The node
 * auto-configuration registers the `taskScheduler()` entry;
 * consumers resolve it with `context.getValue(TASK_SCHEDULER)`.
 */
export const TASK_SCHEDULER = new ContextToken<TaskScheduler>('taskScheduler');
