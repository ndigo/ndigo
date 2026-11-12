[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-application](../README.md) / CreateNodeApplicationOptions

# Interface: CreateNodeApplicationOptions

Options for [createNodeApplication](../functions/createNodeApplication.md). Every implicit action has an
opt-out; app-specific wiring belongs in the hooks and the returned context.

## Properties

### beforeStart?

> `optional` **beforeStart?**: (`context`) => `void` \| `Promise`\<`void`\>

Runs after the context is refreshed and before the socket binds — the
seam for migrations, interceptor registration, and session restore.

#### Parameters

##### context

`ConfigurableApplicationContext`

#### Returns

`void` \| `Promise`\<`void`\>

***

### configFiles?

> `optional` **configFiles?**: `boolean` \| `StandardConfigFileLoader`

`true` (default) loads config files through [nodeConfigFileReader](../../node-config-file-reader/variables/nodeConfigFileReader.md)
(probe locations `./config/` and `./`, overridable via
`NDIGO_CONFIG_LOCATION`); `false` disables file loading, and a loader
instance overrides both.

***

### configureBuilder?

> `optional` **configureBuilder?**: (`builder`) => `void` \| `Promise`\<`void`\>

Extends the preset's builder wiring — secrets, the remote config
source, interception processors, defaults — after the preset's own
settings and before `run()`. The escape hatch for app-specific
configuration that must land before refresh.

#### Parameters

##### builder

`ApplicationBuilder`

#### Returns

`void` \| `Promise`\<`void`\>

***

### platform?

> `optional` **platform?**: `boolean`

`true` (default) registers [NodeAutoConfiguration](../../node-auto-configuration/classes/NodeAutoConfiguration.md).

***

### port?

> `optional` **port?**: `number`

Port used when `PORT` is unset; applied as the `server.port` property.

***

### profiles?

> `optional` **profiles?**: readonly `string`[]

Active profiles. `NDIGO_PROFILES_ACTIVE` and `--profiles.active` still take precedence.

***

### properties?

> `optional` **properties?**: `JSONObject`

Extra builder properties, merged above the `systemEnvironment` source.

***

### resources?

> `optional` **resources?**: readonly [`Closable`](../../graceful-shutdown/interfaces/Closable.md)[]

Extra resources closed after the server and before the context.

***

### shutdown?

> `optional` **shutdown?**: `boolean` \| `Omit`\<[`GracefulShutdownOptions`](../../graceful-shutdown/interfaces/GracefulShutdownOptions.md), `"resources"`\>

`true` (default) installs the `SIGINT`/`SIGTERM` teardown.
