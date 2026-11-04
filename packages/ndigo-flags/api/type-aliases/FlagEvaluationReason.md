[**@ndigo/flags v0.0.1**](../README.md)

***

[@ndigo/flags](../README.md) / FlagEvaluationReason

# Type Alias: FlagEvaluationReason

> **FlagEvaluationReason** = `"STATIC"` \| `"TARGETING_MATCH"` \| `"SPLIT"` \| `"CACHED"` \| `"DISABLED"` \| `"DEFAULT"` \| `"UNKNOWN"` \| `"STALE"` \| `"ERROR"`

Why a flag resolved the way it did — the OpenFeature reason vocabulary
(best-effort metadata: a provider may only supply a subset, and an
unrecognized provider reason surfaces as `UNKNOWN`). `DISABLED` is a
*successful* evaluation — the flag is off, the value is the caller's
default, and there is no `errorCode`.
