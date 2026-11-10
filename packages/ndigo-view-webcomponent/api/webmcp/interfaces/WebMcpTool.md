[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / WebMcpTool

# Interface: WebMcpTool

A tool registered with the browser's model context.

## Properties

### annotations?

> `readonly` `optional` **annotations?**: [`WebMcpToolAnnotations`](WebMcpToolAnnotations.md)

Safety hints.

***

### description

> `readonly` **description**: `string`

What the tool does and when to use it.

***

### execute

> `readonly` **execute**: (`args`, `context`) => `unknown`

Executes the tool; the second argument carries the cancellation signal.

#### Parameters

##### args

`Record`\<`string`, `unknown`\>

##### context

###### signal

`AbortSignal`

#### Returns

`unknown`

***

### exposedTo?

> `readonly` `optional` **exposedTo?**: readonly `string`[]

Origins allowed to see and execute the tool (secure origins only).

***

### inputSchema

> `readonly` **inputSchema**: `Record`\<`string`, `unknown`\>

JSON Schema for the arguments.

***

### name

> `readonly` **name**: `string`

Tool name (unique per document origin).
