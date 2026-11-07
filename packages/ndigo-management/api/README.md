**@ndigo/management v0.0.1**

***

# @ndigo/management v0.0.1

Actuator-style management endpoints for Ndigo Node applications: `/health` (the aggregate component health report) and `/metrics` (the meter snapshot — Prometheus text exposition by default, JSON projection on an explicit `Accept: application/json`). It complements `@ndigo/telemetry`: telemetry _produces_ metric data (OTel instruments, `@counted`); management _serves_ it as HTTP.

## Modules

- [configuration-properties-controller](configuration-properties-controller/README.md)
- [environment-controller](environment-controller/README.md)
- [health](health/README.md)
- [health-controller](health-controller/README.md)
- [health-registry-tokens](health-registry-tokens/README.md)
- [index](index/README.md)
- [loggers-controller](loggers-controller/README.md)
- [management-auto-configuration](management-auto-configuration/README.md)
- [management-properties](management-properties/README.md)
- [metric-aggregator-tokens](metric-aggregator-tokens/README.md)
- [metrics-controller](metrics-controller/README.md)
- [telemetry-health-indicator](telemetry-health-indicator/README.md)
