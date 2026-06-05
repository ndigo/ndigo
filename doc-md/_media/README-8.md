# Blue Factory

## Inversion of Control

Inversion of control (IoC), a.k.a. dependency injection (DI), is a pattern used for decoupling components and layers in the system. The pattern is implemented through injecting dependencies into a component through constructor arguments, arguments to a factory method, or properties that are set on the object instance after it is constructed or returned from a factory method. These dependencies are usually provided as interfaces for further decoupling and to support testability.

## The Factory

The `Factory` API provides the underlaying basis for IoC functionality in BlueJS. The `DefaultFactory` implementation provides the main functionality to the `GenericApplicationContext` container.

`Factory` and its related interfaces, e.g. `FactoryAware`, `Initializable`, `Destroyable`, etc., are important integration points for other framework entities. They allow for very efficient interactions between the container and its components.

## Scope Support

`@blue/factory` now includes built-in scope resolution in `AbstractFactory` via pluggable scope strategies.

### Built-in decorators

- `@singletonScope` — one shared instance per factory (default when no scope is declared)
- `@prototypeScope` — a new instance on each `getValue()` resolution
- `@hashScope` — key-based contextual scope (explicit key activation required)
- `@scope('<name>')` — custom scope marker

### Built-in scope names

- `singleton`
- `prototype`
- `route` (implemented using key-based hash scope)
- `hash`

### Custom scopes

Factories expose scope registration APIs through `ScopedFactory`:

- `registerScope(name, scope)`
- `getScope(name)`
- `getScopeNames()`
- `destroyScopedValue(scopeName, valueName)`

Custom scope implementations conform to the `Scope` interface and use an object-factory callback pattern for lazy creation.

## References

- https://stackoverflow.com/questions/3058/what-is-inversion-of-control
