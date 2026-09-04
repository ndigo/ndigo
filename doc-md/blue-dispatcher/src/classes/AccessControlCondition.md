[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AccessControlCondition

# Class: AccessControlCondition

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:36

A route condition that enforces access control (public vs. private routes).

When a `RouteMappingInfo` carries an `AccessControlCondition`, the dispatcher
will only match the route if the incoming request meets the required access
level.  Private routes require an authenticated principal on the route;
public routes match regardless.

This replaces the previous TODO comment in `route-mapping-info.ts`:
> TODO Create a condition for public vs. private routes

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`AccessControlCondition`\>

## Implements

- [`RouteCondition`](../interfaces/RouteCondition.md)\<`AccessControlCondition`\>

## Constructors

### Constructor

> **new AccessControlCondition**(`access`): `AccessControlCondition`

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:58

Create an access-control condition.

#### Parameters

##### access

[`AccessLevel`](../type-aliases/AccessLevel.md)

The required access level (`'public'` or `'private'`).

#### Returns

`AccessControlCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### access

> `readonly` **access**: [`AccessLevel`](../type-aliases/AccessLevel.md)

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:43

The access level required for this condition.

## Accessors

### content

#### Get Signature

> **get** **content**(): `string`[]

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:45

##### Returns

`string`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:49

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:153

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

## Methods

### merge()

> **merge**(`other`): `AccessControlCondition`

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:77

Merge two access-control conditions.

When merging class-level and method-level access conditions, the most
restrictive level wins (private beats public).

#### Parameters

##### other

`AccessControlCondition`

The condition to merge with.

#### Returns

`AccessControlCondition`

The merged condition (most restrictive).

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `AccessControlCondition` \| `null`

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:94

Determine whether this condition matches the given route.

- Public routes always match.
- Private routes require that `route.principal` is set (i.e. the
  request has been authenticated).

#### Parameters

##### route

`Route`

The current route.

#### Returns

`AccessControlCondition` \| `null`

This condition when the route meets the access level, or `null`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`getMatchingCondition`](../interfaces/RouteCondition.md#getmatchingcondition)

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/access-control-condition.ts:119

Compare two access-control conditions by strictness.

Private routes are considered "more specific" than public routes and
therefore sort first.

#### Parameters

##### value

`AccessControlCondition`

The condition to compare against.

##### route?

`Route`\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed (unused here).

#### Returns

`number`

A negative number when `this` is more specific,
         a positive number when `value` is more specific,
         or zero when both have equal specificity.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)

***

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:166

Compare this condition to another value.

#### Parameters

##### value

`any`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-dispatcher/src/route-condition.ts:181

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:190

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)
