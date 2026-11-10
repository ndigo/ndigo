/**
 * Typed `ai.*` configuration for the lab. Provider keys bind through the
 * normal property sources, so a `{cipher:…}` value decrypts at lookup time
 * exactly like every other secret in the framework.
 */
import { configurationProperties } from '@ndigo/boot';
import { ContextToken } from '@ndigo/context';
import { z } from 'zod';

/**
 * Type-safe handle for the bound `AgentLabConfig` bean.
 */
export const AGENT_LAB_CONFIG = new ContextToken<AgentLabConfig>('agentLabConfig');

const aiSchema = z.object({
    baseURL: z.string().default('http://127.0.0.1:1234/v1'),
    model: z.string().default('qwen/qwen3.8-27b'),
    apiKey: z.string().default('lm-studio'),
    maxSteps: z.coerce.number().int().min(1).max(16).default(6),
    modelFlag: z.string().default('ai.chat'),
});

/**
 * Local OpenAI-compatible model settings.
 */
@configurationProperties('ai', { schema: aiSchema })
export class AgentLabConfig {
    /** OpenAI-compatible base URL (LM Studio defaults to port 1234). */
    baseURL!: string;
    /** Model id served by the local provider. */
    model!: string;
    /** Provider API key; use a `{cipher:…}` marker in real deployments. */
    apiKey!: string;
    /** Maximum model calls per request. */
    maxSteps!: number;
    /** Feature flag that must evaluate to `true` for the model to run. */
    modelFlag!: string;
}
