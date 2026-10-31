[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / installSynchronousAnimationFrames

# Function: installSynchronousAnimationFrames()

> **installSynchronousAnimationFrames**(): () => `void`

Installs a synchronous `requestAnimationFrame` mock: each callback runs
immediately (timestamp `0`) instead of on the next frame. jsdom never
fires animation frames, so view engines that attach rendered elements on a
frame tick hang in specs without it.

## Returns

A restore function that reinstates the previous implementation
  (or removes the global entirely when none was present).

() => `void`

## Example

```ts
const restore = installSynchronousAnimationFrames();
// …run specs…
restore();
```
