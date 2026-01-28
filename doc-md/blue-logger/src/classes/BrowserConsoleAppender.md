[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / BrowserConsoleAppender

# Class: BrowserConsoleAppender

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:11

A "clean", empty container.

## Extends

- [`AbstractAppender`](AbstractAppender.md)

## Extended by

- [`ApacheBrowserConsoleAppender`](ApacheBrowserConsoleAppender.md)
- [`CLIBrowserConsoleAppender`](CLIBrowserConsoleAppender.md)
- [`NPMBrowserConsoleAppender`](NPMBrowserConsoleAppender.md)
- [`SyslogBrowserConsoleAppender`](SyslogBrowserConsoleAppender.md)

## Constructors

### Constructor

> **new BrowserConsoleAppender**(`levelMapping`): `BrowserConsoleAppender`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:15

#### Parameters

##### levelMapping

#### Returns

`BrowserConsoleAppender`

#### Overrides

[`AbstractAppender`](AbstractAppender.md).[`constructor`](AbstractAppender.md#constructor)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](../interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Inherited from

[`AbstractAppender`](AbstractAppender.md).[`errorHandler`](AbstractAppender.md#errorhandler)

***

### layout

> **layout**: [`Layout`](../interfaces/Layout.md)

Defined in: packages/blue-logger/src/appender.ts:41

#### Inherited from

[`AbstractAppender`](AbstractAppender.md).[`layout`](AbstractAppender.md#layout)

***

### levels

> `protected` `readonly` **levels**: `string`[]

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:12

***

### levelMapping

> `readonly` **levelMapping**: `any`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:13

## Methods

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:33

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Overrides

[`AbstractAppender`](AbstractAppender.md).[`append`](AbstractAppender.md#append)

***

### appendMessage()

> **appendMessage**(`level`, `message`): `void`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:37

#### Parameters

##### level

[`Level`](Level.md)

##### message

`string`

#### Returns

`void`
