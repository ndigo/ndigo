**@ndigo/jobs v0.0.1**

***

# @ndigo/jobs v0.0.1

Public API of `@ndigo/jobs` — durable job queues, worker execution, and the
transactional outbox for Node.js (AD-72).

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [InProcessJobDriver](classes/InProcessJobDriver.md)
- [InProcessOutboxStore](classes/InProcessOutboxStore.md)
- [JobHandlerRegistry](classes/JobHandlerRegistry.md)
- [JobOutboxPublisher](classes/JobOutboxPublisher.md)
- [JobQueue](classes/JobQueue.md)
- [JobRunner](classes/JobRunner.md)
- [OutboxRelay](classes/OutboxRelay.md)

## Interfaces

- [ClaimOptions](interfaces/ClaimOptions.md)
- [InProcessJobDriverOptions](interfaces/InProcessJobDriverOptions.md)
- [InProcessOutboxStoreOptions](interfaces/InProcessOutboxStoreOptions.md)
- [JobDriver](interfaces/JobDriver.md)
- [JobHandlerContext](interfaces/JobHandlerContext.md)
- [JobHandlerMetadata](interfaces/JobHandlerMetadata.md)
- [JobHandlerOptions](interfaces/JobHandlerOptions.md)
- [JobQueueOptions](interfaces/JobQueueOptions.md)
- [JobRecord](interfaces/JobRecord.md)
- [JobRequest](interfaces/JobRequest.md)
- [JobRunnerOptions](interfaces/JobRunnerOptions.md)
- [JobSpan](interfaces/JobSpan.md)
- [OutboxClaimOptions](interfaces/OutboxClaimOptions.md)
- [OutboxEntry](interfaces/OutboxEntry.md)
- [OutboxPublisher](interfaces/OutboxPublisher.md)
- [OutboxRelayOptions](interfaces/OutboxRelayOptions.md)
- [OutboxStore](interfaces/OutboxStore.md)
- [RegisteredJobHandler](interfaces/RegisteredJobHandler.md)
- [ResolvedJobRequest](interfaces/ResolvedJobRequest.md)

## Type Aliases

- [JobHandler](type-aliases/JobHandler.md)
- [JobId](type-aliases/JobId.md)

## Variables

- [DEFAULT\_MAX\_ATTEMPTS](variables/DEFAULT_MAX_ATTEMPTS.md)
- [JOB\_DRIVER](variables/JOB_DRIVER.md)
- [JOB\_HANDLER\_METADATA\_PREFIX](variables/JOB_HANDLER_METADATA_PREFIX.md)
- [JOB\_HANDLER\_REGISTRY](variables/JOB_HANDLER_REGISTRY.md)
- [JOB\_QUEUE](variables/JOB_QUEUE.md)
- [JOB\_RUNNER](variables/JOB_RUNNER.md)

## Functions

- [getJobHandlerMetadata](functions/getJobHandlerMetadata.md)
- [jobHandler](functions/jobHandler.md)
- [likeJobDriver](functions/likeJobDriver.md)
- [likeJobHandlerRegistry](functions/likeJobHandlerRegistry.md)
- [likeOutboxStore](functions/likeOutboxStore.md)
- [parseJobPayload](functions/parseJobPayload.md)
- [resolveJobRequest](functions/resolveJobRequest.md)
- [serializeJobPayload](functions/serializeJobPayload.md)
- [startJobSpan](functions/startJobSpan.md)
