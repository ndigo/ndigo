[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / GenericApplicationContext

# Class: GenericApplicationContext

Defined in: packages/blue-context/src/context.ts:304

Default application context implementation used throughout the package.

## Extends

- [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & [`ResourceLoader`](../interfaces/ResourceLoader.md) & `DefaultFactory`\<`this`\>

## Extended by

- [`ProxiedGenericApplicationContext`](ProxiedGenericApplicationContext.md)
- [`MetadataConfigApplicationContext`](MetadataConfigApplicationContext.md)

## Indexable

> \[`key`: `string`\]: `any`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new GenericApplicationContext**(`name?`, `data?`): `GenericApplicationContext`

Defined in: packages/blue-context/src/context.ts:403

Creates a new application context.

#### Parameters

##### name?

`string`

The optional context name.

##### data?

`JSONObject`

Optional initial values to register.

#### Returns

`GenericApplicationContext`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).constructor`

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:317

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/src/context.ts:318

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

Defined in: packages/blue-context/src/context.ts:319

***

### processors

> **processors**: `EntryProcessor`[]

Defined in: packages/blue-factory/lib/factory.d.ts:126

A list of entry processors applied to instances.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).processors`

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:130

Indicates if there are any construction-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructionAwareProcessors`

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:134

Indicates if there are any destruction-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasDestructionAwareProcessors`

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:138

Indicates if there are any initialization-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInitializationAwareProcessors`

## Accessors

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:324

The lazily created environment for this context.

##### Returns

[`Environment`](../interfaces/Environment.md)

***

### contentSource

#### Get Signature

> **get** **contentSource**(): `ContentSource`

Defined in: packages/blue-context/src/context.ts:334

The content source used to resolve theme content.

##### Returns

`ContentSource`

***

### children

#### Get Signature

> **get** **children**(): readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

Defined in: packages/blue-context/src/context.ts:341

The direct child contexts.

##### Returns

readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

***

### id

#### Get Signature

> **get** **id**(): `number`

Defined in: packages/blue-context/src/context.ts:348

The stable identifier assigned at construction.

##### Returns

`number`

***

### isActive

#### Get Signature

> **get** **isActive**(): `boolean`

Defined in: packages/blue-context/src/context.ts:355

Indicates whether the context has been refreshed and not yet closed.

##### Returns

`boolean`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: packages/blue-context/src/context.ts:362

The configured context name.

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

Defined in: packages/blue-context/src/context.ts:369

The current parent context.

##### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).parent`

***

### path

#### Get Signature

> **get** **path**(): `string`

Defined in: packages/blue-context/src/context.ts:376

The slash-delimited hierarchy path from the root to this context.

##### Returns

`string`

***

### themeName

#### Get Signature

> **get** **themeName**(): `string`

Defined in: packages/blue-context/src/context.ts:393

The default theme name associated with this context.

##### Returns

`string`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).[toStringTag]`

## Methods

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

***

### close()

> **close**(): `void`

Defined in: packages/blue-context/src/context.ts:479

Closes the context and all descendants.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/context.ts:524

Releases this context's resources.

#### Returns

`void`

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

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-context/src/context.ts:585

Initializes the context lifecycle if it is not already active.

#### Returns

`void`

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

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setParent`

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

***

### \_createEnvironment()

> `protected` **\_createEnvironment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:696

#### Returns

[`Environment`](../interfaces/Environment.md)

***

### \_createThemeResolver()

> `protected` **\_createThemeResolver**(): `ThemeResolver`

Defined in: packages/blue-context/src/context.ts:700

#### Returns

`ThemeResolver`

***

### \_destroyValues()

> `protected` **\_destroyValues**(): `void`

Defined in: packages/blue-context/src/context.ts:712

#### Returns

`void`

***

### \_finishFactoryInitialization()

> `protected` **\_finishFactoryInitialization**(): `void`

Defined in: packages/blue-context/src/context.ts:730

#### Returns

`void`

***

### \_onRefresh()

> `protected` **\_onRefresh**(): `void`

Defined in: packages/blue-context/src/context.ts:744

#### Returns

`void`

***

### \_postProcessFactory()

> `protected` **\_postProcessFactory**(): `void`

Defined in: packages/blue-context/src/context.ts:746

#### Returns

`void`

***

### \_prepareFactory()

> `protected` **\_prepareFactory**(): `void`

Defined in: packages/blue-context/src/context.ts:748

#### Returns

`void`

***

### \_invokeRegistryProcessors()

> `protected` **\_invokeRegistryProcessors**(): `void`

Defined in: packages/blue-context/src/context.ts:758

#### Returns

`void`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:74

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).eventTypes`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listenerCount`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listeners`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).on`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).off`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getResource`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).addProcessor`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getInstance`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._checkVersion`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyScopedValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getScope`

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: packages/blue-factory/lib/factory.d.ts:206

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getScopeNames`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructor`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInstance`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasOwnValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).registerScope`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsAfterConstruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsAfterInitialization`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeConstruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeDestruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeInitialization`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._configure`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._create`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._initialize`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._populate`
