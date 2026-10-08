/**
 * Public API of `@blue/cluster` — the process supervisor for replicated
 * worker slots (AD-74).
 *
 * @module blue-cluster
 * @since 1.0.0
 * @author Jeff Rose
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
