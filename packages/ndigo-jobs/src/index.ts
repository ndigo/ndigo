/**
 * Public API of `@ndigo/jobs` — durable job queues, worker execution, and the
 * transactional outbox for Node.js (AD-72).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

export type { ClaimOptions, JobId, JobRecord, JobRequest, ResolvedJobRequest } from './job';
export { likeJobDriver, type JobDriver } from './job-driver';
export { DEFAULT_MAX_ATTEMPTS, parseJobPayload, resolveJobRequest, serializeJobPayload } from './request';
export { InProcessJobDriver, type InProcessJobDriverOptions } from './in-process-job-driver';
export { JobQueue, type JobQueueOptions } from './job-queue';
export {
    JOB_HANDLER_METADATA_PREFIX,
    getJobHandlerMetadata,
    jobHandler,
    type JobHandler,
    type JobHandlerContext,
    type JobHandlerMetadata,
    type JobHandlerOptions,
} from './job-handler';
export { JobHandlerRegistry, likeJobHandlerRegistry, type RegisteredJobHandler } from './job-handler-registry';
export { JobRunner, type JobRunnerOptions } from './job-runner';
export { startJobSpan, type JobSpan } from './telemetry';
export {
    JobOutboxPublisher,
    likeOutboxStore,
    type OutboxClaimOptions,
    type OutboxEntry,
    type OutboxPublisher,
    type OutboxStore,
} from './outbox';
export { InProcessOutboxStore, type InProcessOutboxStoreOptions } from './in-process-outbox-store';
export { OutboxRelay, type OutboxRelayOptions } from './outbox-relay';
export { JOB_DRIVER, JOB_HANDLER_REGISTRY, JOB_QUEUE, JOB_RUNNER } from './context-tokens';
