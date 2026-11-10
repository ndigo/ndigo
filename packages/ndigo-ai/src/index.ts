/**
 * Public API of `@ndigo/ai` — provider-neutral messages, the language-model
 * contract, a bounded tool-calling loop over `@ndigo/mcp`-compatible tool
 * sources, and SSE framing.
 */
export {
    AiAgent,
    type AiAgentOptions,
    type AiAgentStream,
    type AiRateLimitOptions,
    type AiRolloutOptions,
    type AiRunRequest,
    type AiRunResult,
    type AiStreamEvent,
} from './agent';
export { AiModelDisabledError, AiRateLimitError } from './errors';
export { type AiFinishReason, type AiMessage, type AiTokenUsage, type AiToolCall, type AiToolResult } from './messages';
export {
    type AiModel,
    type AiModelInfo,
    type AiObjectRequest,
    type AiObjectResult,
    type AiStepRequest,
    type AiStepResult,
    type AiStepStream,
    type AiStepStreamEvent,
} from './model';
export { type AiServerSentEvent, toServerSentEvents } from './stream';
export { type AiToolCallContext, type AiToolDescriptor, type AiToolSource } from './tools';
