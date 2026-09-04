[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / MetadataConfigApplicationContext

# Class: MetadataConfigApplicationContext

Defined in: packages/blue-context/src/configuration.ts:375

## Extends

- [`GenericApplicationContext`](GenericApplicationContext.md)

## Indexable

> \[`key`: `string`\]: `any`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new MetadataConfigApplicationContext**(`name`): `MetadataConfigApplicationContext`

Defined in: packages/blue-context/src/configuration.ts:378

#### Parameters

##### name

`string`

#### Returns

`MetadataConfigApplicationContext`

#### Overrides

[`GenericApplicationContext`](GenericApplicationContext.md).[`constructor`](GenericApplicationContext.md#constructor)

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:317

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`createdTimestamp`](GenericApplicationContext.md#createdtimestamp)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/src/context.ts:318

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyed`](GenericApplicationContext.md#destroyed)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

Defined in: packages/blue-context/src/context.ts:319

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyedTimestamp`](GenericApplicationContext.md#destroyedtimestamp)

***

### processors

> **processors**: `EntryProcessor`[]

Defined in: packages/blue-factory/lib/factory.d.ts:126

A list of entry processors applied to instances.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`processors`](GenericApplicationContext.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:130

Indicates if there are any construction-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructionAwareProcessors`](GenericApplicationContext.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:134

Indicates if there are any destruction-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasDestructionAwareProcessors`](GenericApplicationContext.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:138

Indicates if there are any initialization-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInitializationAwareProcessors`](GenericApplicationContext.md#hasinitializationawareprocessors)

## Accessors

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:324

The lazily created environment for this context.

##### Returns

[`Environment`](../interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`environment`](GenericApplicationContext.md#environment)

***

### contentSource

#### Get Signature

> **get** **contentSource**(): `ContentSource`

Defined in: packages/blue-context/src/context.ts:334

The content source used to resolve theme content.

##### Returns

`ContentSource`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`contentSource`](GenericApplicationContext.md#contentsource)

***

### children

#### Get Signature

> **get** **children**(): readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

Defined in: packages/blue-context/src/context.ts:341

The direct child contexts.

##### Returns

readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`children`](GenericApplicationContext.md#children)

***

### id

#### Get Signature

> **get** **id**(): `number`

Defined in: packages/blue-context/src/context.ts:348

The stable identifier assigned at construction.

##### Returns

`number`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`id`](GenericApplicationContext.md#id)

***

### isActive

#### Get Signature

> **get** **isActive**(): `boolean`

Defined in: packages/blue-context/src/context.ts:355

Indicates whether the context has been refreshed and not yet closed.

##### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`isActive`](GenericApplicationContext.md#isactive)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: packages/blue-context/src/context.ts:362

The configured context name.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`name`](GenericApplicationContext.md#name)

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

Defined in: packages/blue-context/src/context.ts:369

The current parent context.

##### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`parent`](GenericApplicationContext.md#parent)

***

### path

#### Get Signature

> **get** **path**(): `string`

Defined in: packages/blue-context/src/context.ts:376

The slash-delimited hierarchy path from the root to this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`path`](GenericApplicationContext.md#path)

***

### themeName

#### Get Signature

> **get** **themeName**(): `string`

Defined in: packages/blue-context/src/context.ts:393

The default theme name associated with this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`themeName`](GenericApplicationContext.md#themename)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/lib/factory.d.ts:143

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`[toStringTag]`](GenericApplicationContext.md#tostringtag)

## Methods

### register()

> **register**(`configClass`): `void`

Defined in: packages/blue-context/src/configuration.ts:388

Registers a configuration class for metadata-driven initialization.

#### Parameters

##### configClass

`any`

The configuration class to parse.

#### Returns

`void`

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Defined in: packages/blue-context/src/context.ts:458

Broadcasts an event to all descendants.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`broadcast`](GenericApplicationContext.md#broadcast)

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Defined in: packages/blue-context/src/context.ts:472

Emits an event to parent contexts.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`bubble`](GenericApplicationContext.md#bubble)

***

### close()

> **close**(): `void`

Defined in: packages/blue-context/src/context.ts:479

Closes the context and all descendants.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`close`](GenericApplicationContext.md#close)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/context.ts:524

Releases this context's resources.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroy`](GenericApplicationContext.md#destroy)

***

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: packages/blue-context/src/context.ts:535

Resolves content locally and then delegates to the parent if needed.

#### Parameters

##### key

`string`

The content key.

##### language

`string`

The language identifier.

#### Returns

`string`

The resolved content.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getContent`](GenericApplicationContext.md#getcontent)

***

### getTheme()

> **getTheme**(`name?`): `Theme`

Defined in: packages/blue-context/src/context.ts:551

Resolves a theme by name or the default theme.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

`Theme`

The resolved theme.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getTheme`](GenericApplicationContext.md#gettheme)

***

### hasChild()

> **hasChild**(`node`): `boolean`

Defined in: packages/blue-context/src/context.ts:565

Returns whether the given context is a direct child.

#### Parameters

##### node

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The application context to check for.

#### Returns

`boolean`

`true` when the context is a child, false otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasChild`](GenericApplicationContext.md#haschild)

***

### newChild()

> **newChild**(`name?`, `data?`): [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/context.ts:576

Creates and attaches a child context.

#### Parameters

##### name?

`string`

The optional context name.

##### data?

`JSONObject`

Optional initial child data.

#### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The created child application context.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`newChild`](GenericApplicationContext.md#newchild)

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-context/src/context.ts:585

Initializes the context lifecycle if it is not already active.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`refresh`](GenericApplicationContext.md#refresh)

***

### removeChild()

> **removeChild**(`node`): `boolean`

Defined in: packages/blue-context/src/context.ts:613

Removes a child from the direct child list.

#### Parameters

##### node

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The child application context to remove.

#### Returns

`boolean`

`true` when the child was successfully removed, false otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`removeChild`](GenericApplicationContext.md#removechild)

***

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Defined in: packages/blue-context/src/context.ts:627

Replaces the content source used by this context.

#### Parameters

##### contentSource

`ContentSource`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setContentSource`](GenericApplicationContext.md#setcontentsource)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/context.ts:638

Replaces the environment used by this context.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setEnvironment`](GenericApplicationContext.md#setenvironment)

***

### setId()

> **setId**(`id`): `void`

Defined in: packages/blue-context/src/context.ts:645

Updates the identifier assigned to this context.

#### Parameters

##### id

`number`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setId`](GenericApplicationContext.md#setid)

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-context/src/context.ts:652

Updates the context name.

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setName`](GenericApplicationContext.md#setname)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-context/src/context.ts:659

Reassigns the parent context and keeps the child list in sync.

#### Parameters

##### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setParent`](GenericApplicationContext.md#setparent)

***

### setThemeName()

> **setThemeName**(`themeName`): `void`

Defined in: packages/blue-context/src/context.ts:684

Updates the default theme name.

#### Parameters

##### themeName

`string`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setThemeName`](GenericApplicationContext.md#setthemename)

***

### setThemeResolver()

> **setThemeResolver**(`themeResolver`): `void`

Defined in: packages/blue-context/src/context.ts:691

Overrides the theme resolver used by this context.

#### Parameters

##### themeResolver

`ThemeResolver`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setThemeResolver`](GenericApplicationContext.md#setthemeresolver)

***

### \_createEnvironment()

> `protected` **\_createEnvironment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:696

#### Returns

[`Environment`](../interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_createEnvironment`](GenericApplicationContext.md#_createenvironment)

***

### \_createThemeResolver()

> `protected` **\_createThemeResolver**(): `ThemeResolver`

Defined in: packages/blue-context/src/context.ts:700

#### Returns

`ThemeResolver`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_createThemeResolver`](GenericApplicationContext.md#_createthemeresolver)

***

### \_destroyValues()

> `protected` **\_destroyValues**(): `void`

Defined in: packages/blue-context/src/context.ts:712

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_destroyValues`](GenericApplicationContext.md#_destroyvalues)

***

### \_finishFactoryInitialization()

> `protected` **\_finishFactoryInitialization**(): `void`

Defined in: packages/blue-context/src/context.ts:730

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_finishFactoryInitialization`](GenericApplicationContext.md#_finishfactoryinitialization)

***

### \_onRefresh()

> `protected` **\_onRefresh**(): `void`

Defined in: packages/blue-context/src/context.ts:744

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_onRefresh`](GenericApplicationContext.md#_onrefresh)

***

### \_postProcessFactory()

> `protected` **\_postProcessFactory**(): `void`

Defined in: packages/blue-context/src/context.ts:746

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_postProcessFactory`](GenericApplicationContext.md#_postprocessfactory)

***

### \_prepareFactory()

> `protected` **\_prepareFactory**(): `void`

Defined in: packages/blue-context/src/context.ts:748

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_prepareFactory`](GenericApplicationContext.md#_preparefactory)

***

### \_invokeRegistryProcessors()

> `protected` **\_invokeRegistryProcessors**(): `void`

Defined in: packages/blue-context/src/context.ts:758

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_invokeRegistryProcessors`](GenericApplicationContext.md#_invokeregistryprocessors)

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:68

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`emit`](GenericApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:74

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`eventTypes`](GenericApplicationContext.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:81

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`listenerCount`](GenericApplicationContext.md#listenercount)

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:88

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`listeners`](GenericApplicationContext.md#listeners)

***

### on()

> **on**(`type`, `listener?`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:96

Adds a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md) \| [`EventHandlers`](../type-aliases/EventHandlers.md)

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`on`](GenericApplicationContext.md#on)

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:104

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`off`](GenericApplicationContext.md#off)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

Defined in: packages/blue-context/src/resource.ts:22

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getResource`](GenericApplicationContext.md#getresource)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:161

Adds an entry processor to the factory.

#### Parameters

##### processor

`EntryProcessor`

The entry processor to add.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`addProcessor`](GenericApplicationContext.md#addprocessor)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:167

Destroys a value managed by the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyValue`](GenericApplicationContext.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:168

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyValue`](GenericApplicationContext.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:176

Returns an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the value.

##### argumentsList?

`any`[]

Optional arguments to pass to the constructor if the value is a constructor.

#### Returns

`T`

An instance of the value.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getInstance`](GenericApplicationContext.md#getinstance)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:184

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`T`

The retrieved value.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getValue`](GenericApplicationContext.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:185

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### name

`string`

###### argumentsList?

`any`[]

Optional arguments to pass to the constructor if the value is a constructor.

##### Returns

`T`

The retrieved value.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getValue`](GenericApplicationContext.md#getvalue)

***

### \_checkVersion()

> **\_checkVersion**\<`T`\>(`nameOrToken`, `value`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:189

Checks the resolved value's version against the token's requiredVersion and warns on mismatch.

#### Type Parameters

##### T

`T`

#### Parameters

##### nameOrToken

`string` \| [`ContextToken`](ContextToken.md)\<`T`\>

##### value

`T`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_checkVersion`](GenericApplicationContext.md#_checkversion)

***

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:195

Destroys a scoped value.

#### Parameters

##### scopeName

`string`

The name of the scope.

##### valueName

`string`

The name of the value within the scope.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyScopedValue`](GenericApplicationContext.md#destroyscopedvalue)

***

### getScope()

> **getScope**(`name`): `Scope`

Defined in: packages/blue-factory/lib/factory.d.ts:201

Retrieves a scope by its name.

#### Parameters

##### name

`string`

The name of the scope.

#### Returns

`Scope`

The Scope instance.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getScope`](GenericApplicationContext.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: packages/blue-factory/lib/factory.d.ts:206

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getScopeNames`](GenericApplicationContext.md#getscopenames)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:212

Checks if the factory has a constructor registered under the given name.

#### Parameters

##### name

`string`

The name of the constructor.

#### Returns

`boolean`

`true` if a constructor is registered, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructor`](GenericApplicationContext.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:218

Checks if the factory has an instance registered under the given name.

#### Parameters

##### name

`string`

The name of the instance.

#### Returns

`boolean`

`true` if an instance is registered, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInstance`](GenericApplicationContext.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:224

Checks if the factory has its own value (either an instance or a constructor) registered under the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory has its own value, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasOwnValue`](GenericApplicationContext.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:231

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasValue`](GenericApplicationContext.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:232

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Parameters

###### name

`string`

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasValue`](GenericApplicationContext.md#hasvalue)

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:238

Registers a new scope with the factory.

#### Parameters

##### name

`string`

The name of the scope.

##### scope

`Scope`

The Scope instance to register.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`registerScope`](GenericApplicationContext.md#registerscope)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:250

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setValue`](GenericApplicationContext.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:251

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### name

`string`

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setValue`](GenericApplicationContext.md#setvalue)

***

### \_applyProcessorsAfterConstruction()

> `protected` **\_applyProcessorsAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:259

Applies construction-aware processors after an instance has been constructed.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The constructed instance.

#### Returns

`boolean`

`true` if properties should be populated, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsAfterConstruction`](GenericApplicationContext.md#_applyprocessorsafterconstruction)

***

### \_applyProcessorsAfterInitialization()

> `protected` **\_applyProcessorsAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:267

Applies initialization-aware processors after an instance has been initialized.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The initialized instance.

#### Returns

`T`

The processed instance.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsAfterInitialization`](GenericApplicationContext.md#_applyprocessorsafterinitialization)

***

### \_applyProcessorsBeforeConstruction()

> `protected` **\_applyProcessorsBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList?`): `T` \| `null`

Defined in: packages/blue-factory/lib/factory.d.ts:276

Applies construction-aware processors before an instance is constructed.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### constructor

`Function`

The constructor function.

##### argumentsList?

`any`[]

Optional arguments to pass to the constructor.

#### Returns

`T` \| `null`

The instance to use, or `null` to proceed with default construction.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeConstruction`](GenericApplicationContext.md#_applyprocessorsbeforeconstruction)

***

### \_applyProcessorsBeforeDestruction()

> `protected` **\_applyProcessorsBeforeDestruction**(`name`, `instance`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:282

Applies destruction-aware processors before an instance is destroyed.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`Destroyable`

The instance to be destroyed.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeDestruction`](GenericApplicationContext.md#_applyprocessorsbeforedestruction)

***

### \_applyProcessorsBeforeInitialization()

> `protected` **\_applyProcessorsBeforeInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:290

Applies initialization-aware processors before an instance is initialized.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to be initialized.

#### Returns

`T`

The processed instance.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeInitialization`](GenericApplicationContext.md#_applyprocessorsbeforeinitialization)

***

### \_configure()

> `protected` **\_configure**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:299

Configures an instance by populating properties, invoking aware callbacks, and initializing.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to configure.

#### Returns

`T`

The configured instance.

#### Throws

If configuration fails.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_configure`](GenericApplicationContext.md#_configure)

***

### \_create()

> `protected` **\_create**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:308

Creates a new instance from a registered constructor.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the constructor.

##### argumentsList?

`any`[]

Optional arguments to pass to the constructor.

#### Returns

`T`

The newly created instance.

#### Throws

If instance creation fails.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_create`](GenericApplicationContext.md#_create)

***

### \_initialize()

> `protected` **\_initialize**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:316

Initializes an instance by applying initialization processors and invoking the `init` method if available.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to initialize.

#### Returns

`T`

The initialized instance.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_initialize`](GenericApplicationContext.md#_initialize)

***

### \_populate()

> `protected` **\_populate**\<`T`\>(`name`, `instance`, `properties?`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:324

Populates properties of an instance, applying construction-aware processors.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to populate.

##### properties?

`PropertyDescriptorMap`

Optional property descriptor map to apply.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_populate`](GenericApplicationContext.md#_populate)
