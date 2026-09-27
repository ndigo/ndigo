[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / RateLimitPolicy

# Interface: RateLimitPolicy

A route's rate-limit policy: at most `limit` requests per `windowMs`
per client key (SEC-6).

## Properties

### limit

> **limit**: `number`

Maximum requests allowed within the window. Positive integer.

***

### windowMs

> **windowMs**: `number`

Window length in milliseconds. Positive integer.
