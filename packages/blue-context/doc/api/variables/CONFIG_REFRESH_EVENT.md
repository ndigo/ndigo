[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / CONFIG\_REFRESH\_EVENT

# Variable: CONFIG\_REFRESH\_EVENT

> `const` **CONFIG\_REFRESH\_EVENT**: `"config:refresh"` = `'config:refresh'`

Event emitted by a [ConfigurableEnvironment](../interfaces/ConfigurableEnvironment.md) after `refresh()`
recomputes from its current sources (AD-29 D-1). Listeners read fresh
state; the event carries no payload.
