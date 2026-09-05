[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / resolvePreHandleOutcome

# Function: resolvePreHandleOutcome()

> **resolvePreHandleOutcome**(`route`, `outcome`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-75)

Normalizes a `preHandle` outcome: `true` allows; `false` is the default
denial; an [InterceptorDenial](../interfaces/InterceptorDenial.md) is an explicit denial (stored on the
route). Both denials return `false` for chain compatibility.

## Parameters

### route

[`Route`](#)

### outcome

`boolean` \| [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

## Returns

`boolean`
