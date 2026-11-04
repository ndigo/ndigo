/**
 * Type-safe bean handles for the ndigo-jobs contracts.
 *
 * @module ndigo-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/factory';
import type { JobDriver } from './job-driver';
import type { JobQueue } from './job-queue';
import type { JobHandlerRegistry } from './job-handler-registry';
import type { JobRunner } from './job-runner';

/**
 * Token for the active {@link JobDriver} bean. `NodeAutoConfiguration`
 * registers the in-process default; apps register a durable driver to
 * replace it.
 */
export const JOB_DRIVER = new ContextToken<JobDriver>('jobDriver');

/**
 * Token for the producer-facing {@link JobQueue} bean.
 */
export const JOB_QUEUE = new ContextToken<JobQueue>('jobQueue');

/**
 * Token for the {@link JobHandlerRegistry} bean that scans `@jobHandler`
 * methods and holds the registered handlers.
 */
export const JOB_HANDLER_REGISTRY = new ContextToken<JobHandlerRegistry>('jobHandlerRegistry');

/**
 * Token for the {@link JobRunner} bean that polls the driver and executes
 * handlers.
 */
export const JOB_RUNNER = new ContextToken<JobRunner>('jobRunner');
