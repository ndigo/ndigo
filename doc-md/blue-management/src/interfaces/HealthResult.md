[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthResult

# Interface: HealthResult

Defined in: [packages/blue-management/src/health.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-21)

The health result of a single indicator.

## Properties

### status

> **status**: [`HealthState`](../type-aliases/HealthState.md)

Defined in: [packages/blue-management/src/health.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-23)

Overall state.

***

### details?

> `optional` **details?**: `Record`\<`string`, `unknown`\>

Defined in: [packages/blue-management/src/health.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-25)

Optional details (e.g. aggregated metric counts).
