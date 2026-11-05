# Feature Metric Naming and Dashboard Patterns

## Scope

This reference standardizes per-feature metric naming and dashboard presentation for ndigo runtime telemetry.

It applies to:

- `FeatureMetricAggregator` usage from `@ndigo/telemetry`
- `@counted(...)` feature-attributed counters
- Shell/feature diagnostics surfaces such as `feature-metrics-panel`

---

## Naming Convention

### Base Pattern

Use the following metric-key format:

`<feature>.<metricName>`

Where:

- `<feature>` is a lowercase feature namespace (e.g., `todo`, `account`, `search`)
- `<metricName>` is camelCase and role-descriptive

### Examples

- `todo.mountCount`
- `todo.activateCount`
- `todo.unmountCount`
- `todo.registeredRelayCount`
- `todo.activeRelayCount`
- `account.activateCount`
- `account.routeHandledCount`

### Rules

1. **Prefix every metric with feature namespace.**
2. **Use semantic suffixes for units/intent:**
    - `*Count` for monotonic counters
    - `*Rate` for derived rate values
    - `*LatencyMs` for durations
    - `*Size` for collection/cardinality size snapshots
3. **Do not encode route paths or user identifiers in metric keys.** Put those in attributes only when needed and low-cardinality.
4. **Keep keys stable.** Renaming is a breaking analytics change for dashboards.

---

## Counter vs Gauge Guidance

- **Counter:** use when value only increases over time.
    - Example: `account.routeHandledCount`
- **Gauge:** use for latest observed snapshot.
    - Example: `todo.activeRelayCount`

### Derived Metrics

Derived metrics are computed from counters/gauges and are not necessarily emitted as persisted raw keys.

- `*.routeHandledRate` (events per second) derived from `*.routeHandledCount` delta over refresh interval
- `*.latencyMs` derived from duration buckets or measured timing spans

For dashboards, prefer explicit derived section labels and include interval context (e.g., `/s`).

### Reusable Rate Resolution (`CounterRateResolver`)

Use `CounterRateResolver` from `@ndigo/telemetry` to compute `counter-delta / elapsed-time` rates across features.

```ts
import { CounterRateResolver, FeatureMetricAggregator } from '@ndigo/telemetry';

const aggregator = new FeatureMetricAggregator();

const resolver = new CounterRateResolver({
    aggregator,
    thresholds: new Map([['account.routeHandledCount', 5]]),
});

const snapshots = resolver.resolve();
// [{ feature: 'account', counterKey: 'account.routeHandledCount', ratePerSecond: 10 }]

const alerts = resolver.resolveAlerts(snapshots);
// [{ feature: 'account', counterKey: 'account.routeHandledCount', ratePerSecond: 10, threshold: 5 }]
```

Notes:

- First `resolve()` call returns zero rates because there is no previous snapshot baseline.
- Call `reset()` when switching aggregator instances or dashboard context.
- Thresholds are keyed by full counter key (e.g., `todo.routeHandledCount`).

### Sliding-Window Rate Computation

`CounterRateResolver` supports configurable sliding-window averaging for more stable rate calculations.

```ts
import { CounterRateResolver, FeatureMetricAggregator } from '@ndigo/telemetry';

const aggregator = new FeatureMetricAggregator();

// Window of 5 samples (default: 1 for point-to-point)
const resolver = new CounterRateResolver({
    aggregator,
    windowSize: 5,
});

// Over multiple resolve() calls, the rate is computed from
// the oldest retained sample to the current sample
const snapshots = resolver.resolve();
// Rate = (currentValue - oldestValue) / (currentTime - oldestTime)
```

**Window Size Behavior:**

- `windowSize: 1` (default): Point-to-point delta between consecutive `resolve()` calls
- `windowSize: N`: Averages rate across last N intervals (requires N+1 samples)
- Older samples beyond the window are automatically evicted
- First resolve returns zero rates (no baseline sample yet)

**When to Use:**

- **Small window (1-3):** Responsive to rapid changes, but noisy
- **Medium window (5-10):** Balanced stability and responsiveness
- **Large window (20+):** Smooth long-term trends, less responsive to spikes

### Current Mapping in Demo

- **Counters:**
    - `todo.mountCount`, `todo.activateCount`, `todo.unmountCount`, `todo.registeredRelayCount`, `todo.blockedRelayCount`
    - `account.activateCount`, `account.unmountCount`, `account.routeHandledCount`
- **Gauges:**
    - `todo.activeRelayCount`, `todo.blockedRelayCount`, `todo.relayedEventCount`

---

## Dashboard Presentation Pattern

Present metrics grouped by feature:

1. **Feature header** (e.g., `todo`, `account`)
2. **Counters section**
3. **Gauges section**
4. **Derived section** (rates/latencies)
5. **Optional timestamp** (`updatedAt`)

### Optional Alert Thresholds

Dashboards may apply threshold labels to derived metrics. Example:

- `account.routeHandledRate: 10.00/s (ALERT: > 5.00/s)`

Thresholds should be configurable per metric and kept environment-specific (dev/staging/prod).

Recommended sort order:

- Primary: feature name ascending
- Secondary: metric key ascending

Fallback behavior:

- If no metrics are available, render a user-facing empty state:
    - `No feature metrics available yet.`

---

## Duration Metrics

### Recording Latency

Use `FeatureMetricAggregator.recordDuration()` to track operation latencies:

```ts
import { FeatureMetricAggregator } from '@ndigo/telemetry';

const aggregator = new FeatureMetricAggregator();

// Record individual operation durations
aggregator.recordDuration('todo', 'todo.routeLatency', 45.2);
aggregator.recordDuration('todo', 'todo.routeLatency', 52.8);
aggregator.recordDuration('todo', 'todo.routeLatency', 38.1);

const metrics = aggregator.getFeatureMetrics('todo');
const latencySummary = metrics.durations.get('todo.routeLatency');
// {
//   count: 3,
//   min: 38.1,
//   max: 52.8,
//   mean: 45.366...,
//   p50: 45.2
// }
```

### Duration Summary Statistics

- **count**: Number of samples recorded
- **min**: Minimum observed duration (ms)
- **max**: Maximum observed duration (ms)
- **mean**: Average duration (ms)
- **p50**: Median duration (ms) — 50th percentile

### Sample Buffer Management

Configure `maxDurationSamples` to control memory usage:

```ts
const aggregator = new FeatureMetricAggregator({
    maxDurationSamples: 500, // default: 1000
});
```

When the buffer is full, oldest samples are evicted (circular buffer).

### Naming Convention for Duration Metrics

Use `*LatencyMs` or `*DurationMs` suffix:

- `todo.routeLatencyMs`
- `account.queryDurationMs`
- `search.indexLatencyMs`

### Dashboard Presentation

Present durations alongside counters/gauges:

```
Feature: todo
  Counters:
    - todo.routeHandledCount: 42
  Gauges:
    - todo.activeRelayCount: 3
  Durations:
    - todo.routeLatencyMs: p50=45ms, mean=47ms, max=120ms (42 samples)
```

---

## Instrumentation Patterns

### Cross-Package Shared Recorder (Router + Context + App)

Use one shared recorder instance across runtime layers to avoid duplicate metric wiring:

```ts
import { FeatureContextMountManager } from '@ndigo/context';
import { FeatureRoutingRegistry } from '@ndigo/router';
import { FeatureMetricAggregator } from '@ndigo/telemetry';

const featureMetrics = new FeatureMetricAggregator();

const featureMountManager = new FeatureContextMountManager(shellContext, {
    metricRecorder: featureMetrics,
});

const featureRoutingRegistry = new FeatureRoutingRegistry(undefined, {
    activationPolicy: 'exclusive',
    metricRecorder: featureMetrics,
});
```

With this pattern:

- `@ndigo/context` emits mount lifecycle metrics (`*.mountCount`, `*.unmountCount`, `*.isMounted`)
- `@ndigo/router` emits routing lifecycle metrics (`*.activateCount`, `*.deactivateCount`, `*.routeHandledCount`, `*.isActive`)
- App-level code can reserve manual metrics for domain-specific signals (e.g., relay diagnostics)

### Decorator + Aggregator

```ts
@counted({
    name: 'todo.itemCreatedCount',
    attributes: { feature: 'todo' },
    featureAggregator,
})
createItem() {
    // ...
}
```

### Manual Aggregator Updates

```ts
featureMetricAggregator.incrementCounter('todo', 'todo.activateCount');
featureMetricAggregator.setGauge('todo', 'todo.activeRelayCount', activeRelayCount);
```

---

## Stability and Compatibility

- Treat metric-key changes as contract changes.
- Prefer adding new keys over mutating meaning of existing keys.
- If a rename is required, support overlap period where both keys are emitted.
