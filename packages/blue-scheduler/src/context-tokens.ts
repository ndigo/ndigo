/**
 * Type-safe bean handles for the blue-scheduler contracts (AD-34 D1).
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { TaskScheduler } from './task-scheduler';

/**
 * Token for the node platform's {@link TaskScheduler} bean. The node
 * auto-configuration registers the entry (`@entry taskScheduler()`); the
 * registry and consumers resolve it without a string:
 * `context.getValue(TASK_SCHEDULER)`.
 */
export const TASK_SCHEDULER = new ContextToken<TaskScheduler>('taskScheduler');
