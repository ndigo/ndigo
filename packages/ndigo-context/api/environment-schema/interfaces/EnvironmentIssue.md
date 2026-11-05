[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [environment-schema](../README.md) / EnvironmentIssue

# Interface: EnvironmentIssue

A single validation issue: the property path that failed, what was
expected, and what the environment actually held.

## Properties

### actual

> **actual**: `JSONValue` \| `undefined`

The actual resolved value (raw).

***

### expected

> **expected**: `string`

Human-readable expectation from the schema.

***

### path

> **path**: `string`

The property keypath that failed (e.g. `server.port`).
