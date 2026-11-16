/**
 * Public API of `@ndigo/cluster` — the process supervisor for replicated
 * worker slots.
 */

export {
    ClusterRunner,
    runCluster,
    type ClusterChild,
    type ClusterRunResult,
    type ClusterRunnerOptions,
    type ClusterSignalHost,
    type ClusterSlotSnapshot,
    type ClusterSpawner,
    type ClusterStopReason,
} from './cluster-runner.js';
