[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / nested

# Function: nested()

> **nested**(`value`, `context`): `void`

Marks a `@property('prefix')` field as a nested configuration object: bind
recursively into this plain-class field under the property's keypath
(AD-15 D3). One prefix mechanism (`@property`), one recursion flag.

## Parameters

### value

`undefined`

### context

`ClassFieldDecoratorContext`

## Returns

`void`

A field decorator.

## Example

```ts
@configurationProperties('server')
class ServerConfig {
    @property('port') @defaultValue('8080') port!: number;
    @property('db') @nested db!: DbConfig;
}
class DbConfig { @property('url') url!: string; } // binds server.db.url
```
