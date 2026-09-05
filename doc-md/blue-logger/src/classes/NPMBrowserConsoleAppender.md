[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / NPMBrowserConsoleAppender

# Class: NPMBrowserConsoleAppender

Defined in: packages/blue-logger/src/npm-logging.ts:95

A "clean", empty container.

## Extends

- [`BrowserConsoleAppender`](BrowserConsoleAppender.md)

## Constructors

### Constructor

> **new NPMBrowserConsoleAppender**(): `NPMBrowserConsoleAppender`

Defined in: packages/blue-logger/src/npm-logging.ts:96

#### Returns

`NPMBrowserConsoleAppender`

#### Overrides

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`constructor`](BrowserConsoleAppender.md#constructor)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](../interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`errorHandler`](BrowserConsoleAppender.md#errorhandler)

---

### layout

> **layout**: [`Layout`](../interfaces/Layout.md)

Defined in: packages/blue-logger/src/appender.ts:41

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`layout`](BrowserConsoleAppender.md#layout)

---

### levels

> `protected` `readonly` **levels**: `string`[]

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:12

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`levels`](BrowserConsoleAppender.md#levels)

---

### levelMapping

> `readonly` **levelMapping**: `any`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:13

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`levelMapping`](BrowserConsoleAppender.md#levelmapping)

## Methods

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appenders/browser-console-appender.ts:33

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`append`](BrowserConsoleAppender.md#append)

---

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

#### Inherited from

[`BrowserConsoleAppender`](BrowserConsoleAppender.md).[`appendMessage`](BrowserConsoleAppender.md#appendmessage)
