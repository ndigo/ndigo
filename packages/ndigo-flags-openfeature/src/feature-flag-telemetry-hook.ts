/**
 * Evaluation telemetry as an OpenFeature hook (AD-87 D-7): one INTERNAL
 * `feature_flag.evaluation` span per evaluation carrying the OpenTelemetry
 * feature-flag semconv attributes — `feature_flag.key`,
 * `feature_flag.provider.name`, `feature_flag.result.reason`,
 * `feature_flag.result.variant` — plus `error.type` on abnormal outcomes.
 *
 * Registration is explicit and per scope: `client.addHooks(hook)`, or
 * globally via `OpenFeature.addHooks(hook)`. The span opens in `before` and
 * ends in `finally`, so provider latency is inside it. The OTel API is a
 * no-op until the application wires a provider (`@ndigo/telemetry-node` /
 * `@ndigo/telemetry-web`), which makes the hook inert by default.
 *
 * The hook is synchronous, so the same instance also satisfies the web
 * SDK's hook contract (`OpenFeature.addHooks` in the browser).
 */ import { SpanKind, SpanStatusCode, trace, type Span } from '@opentelemetry/api';
import type {
    BeforeHookContext,
    EvaluationDetails,
    FlagValue,
    Hook,
    HookContext,
    HookHints,
} from '@openfeature/server-sdk';

/** Tracer identity — the bridge's instrumenting scope. */
const TRACER_NAME = '@ndigo/flags-openfeature';

/** The span name: low cardinality; the flag key rides as an attribute. */
const SPAN_NAME = 'feature_flag.evaluation';

/** `hookData` key under which an evaluation's span travels between phases. */
const FLAG_SPAN_KEY = 'ndigo:featureFlagSpan';

/**
 * Emits one evaluation span per flag evaluation with the
 * `feature_flag.*` semconv attributes. Abnormal evaluations — any
 * resolution carrying an `errorCode`, from `FLAG_NOT_FOUND` to provider
 * failures — route through the OpenFeature **error** phase by SDK design:
 * the span gets ERROR status, the exception, and the classification as
 * `error.type` (the OpenFeature error code when present, else the error's
 * name). Clean resolutions get reason/variant attributes.
 */
export class FeatureFlagTelemetryHook implements Hook {
    /**
     * Opens the evaluation span and records the key/provider identity.
     *
     * @param hookContext - The hook context for the evaluation being started.
     * @param _hookHints - OpenFeature hook hints; unused.
     */
    before(hookContext: BeforeHookContext, _hookHints?: HookHints): void {
        const span = trace.getTracer(TRACER_NAME).startSpan(SPAN_NAME, { kind: SpanKind.INTERNAL });
        span.setAttribute('feature_flag.key', hookContext.flagKey);
        span.setAttribute('feature_flag.provider.name', hookContext.providerMetadata.name);
        hookContext.hookData.set(FLAG_SPAN_KEY, span);
    }

    /**
     * Annotates the span with the resolution outcome (reason, variant) —
     * clean resolutions only; errorCode results route through
     * {@link error} (the SDK's hook contract).
     *
     * @param hookContext - The hook context carrying the evaluation's span.
     * @param evaluationDetails - The resolved flag value and its metadata.
     * @param _hookHints - OpenFeature hook hints; unused.
     */
    after(
        hookContext: Readonly<HookContext>,
        evaluationDetails: EvaluationDetails<FlagValue>,
        _hookHints?: HookHints
    ): void {
        const span = this.#spanOf(hookContext);
        if (span === undefined) {
            return;
        }
        if (evaluationDetails.reason !== undefined) {
            span.setAttribute('feature_flag.result.reason', String(evaluationDetails.reason));
        }
        if (evaluationDetails.variant !== undefined) {
            span.setAttribute('feature_flag.result.variant', evaluationDetails.variant);
        }
    }

    /**
     * Records abnormal evaluations: span status ERROR, the exception, and
     * the OpenFeature error classification as `error.type` — the error
     * code when the error carries one, else the error's name.
     *
     * @param hookContext - The hook context carrying the evaluation's span.
     * @param error - The error that aborted the evaluation.
     * @param _hookHints - OpenFeature hook hints; unused.
     */
    error(hookContext: Readonly<HookContext>, error: unknown, _hookHints?: HookHints): void {
        const span = this.#spanOf(hookContext);
        if (span === undefined) {
            return;
        }
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        // OpenFeature errors carry their classification on `code`; duck-typed
        // so the hook does not import the SDK's error class hierarchy.
        const code = (error as { code?: unknown } | null)?.code;
        span.setAttribute(
            'error.type',
            typeof code === 'string' ? code : error instanceof Error ? error.name : 'unknown'
        );
    }

    /**
     * Ends the span (success or failure path — `finally` always runs).
     *
     * @param hookContext - The hook context carrying the evaluation's span.
     * @param _evaluationDetails - The evaluation details; unused.
     * @param _hookHints - OpenFeature hook hints; unused.
     */
    finally(
        hookContext: Readonly<HookContext>,
        _evaluationDetails: EvaluationDetails<FlagValue>,
        _hookHints?: HookHints
    ): void {
        const span = this.#spanOf(hookContext);
        if (span === undefined) {
            return;
        }
        hookContext.hookData.delete(FLAG_SPAN_KEY);
        span.end();
    }

    /**
     * Reads this hook's span back out of the untyped `hookData` store.
     */
    #spanOf(hookContext: Readonly<HookContext>): Span | undefined {
        // The store is keyed by string for callers outside the typed view.
        return hookContext.hookData.get(FLAG_SPAN_KEY) as Span | undefined;
    }
}
