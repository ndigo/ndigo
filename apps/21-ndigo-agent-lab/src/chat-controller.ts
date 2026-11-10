/**
 * `POST /api/chat`: streams one agent run over SSE. The agent, tool registry,
 * limits, and rollout flag are built lazily from the application context so
 * the dispatcher's mappings are fully registered first.
 */
import '@tsmetadata/polyfill';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { AiAgent, toServerSentEvents } from '@ndigo/ai';
import { aiSdkModel } from '@ndigo/ai-sdk';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import {
    ARGUMENT_RESOLVERS,
    bodyValue,
    DISPATCHER,
    parameters,
    postMapping,
    requestMapping,
    validatedBy,
} from '@ndigo/dispatcher';
import { $aware } from '@ndigo/factory';
import { PropertyFlagProvider } from '@ndigo/flags';
import { McpToolRegistry } from '@ndigo/mcp';
import { ServerSentEventView } from '@ndigo/platform-node';
import { FixedWindowRateLimiter } from '@ndigo/rate-limit';
import { z } from 'zod';
import { AGENT_LAB_CONFIG } from './agent-lab-config';

const chatRequestSchema = z.object({
    prompt: z.string().min(1),
    maxTokens: z.number().int().positive().max(4096).optional(),
});

/**
 * The chat request body.
 */
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Streams the agent's events as Server-Sent Events.
 */
@requestMapping('/')
export class ChatController implements ApplicationContextAware {
    #context: ApplicationContext | null = null;
    #agent: AiAgent | null = null;

    /**
     * Marks this bean for aware injection; the agent is resolved lazily so
     * the dispatcher mappings are registered before the registry is built.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * @param context - The application context that owns this controller.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Runs one prompt through the tool loop and streams the result.
     *
     * @param request - The validated request body.
     * @returns The SSE view.
     */
    @postMapping('/api/chat')
    @parameters({ request: validatedBy(chatRequestSchema, bodyValue()) })
    chat(request: ChatRequest): ServerSentEventView {
        return new ServerSentEventView(
            toServerSentEvents(
                this.#resolveAgent().stream({
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are an order assistant. Use the provided tools instead of guessing order data.',
                        },
                        { role: 'user', content: request.prompt },
                    ],
                    ...(request.maxTokens === undefined ? {} : { maxOutputTokens: request.maxTokens }),
                })
            )
        );
    }

    #resolveAgent(): AiAgent {
        if (this.#agent !== null) return this.#agent;
        if (this.#context === null) {
            throw new Error('ChatController has no application context');
        }
        const context = this.#context;
        const config = context.getValue(AGENT_LAB_CONFIG);
        const provider = createOpenAICompatible({
            name: 'lmstudio',
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            includeUsage: true,
        });
        const model = aiSdkModel(provider.chatModel(config.model), {
            provider: 'lmstudio',
            model: config.model,
        });
        const tools = McpToolRegistry.from(context.getValue(DISPATCHER), {
            readOnly: true,
            argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
        });
        const flags = new PropertyFlagProvider({
            getProperty: (key) => context.environment.getProperty(key),
        });

        this.#agent = new AiAgent({
            model,
            tools,
            maxSteps: config.maxSteps,
            rateLimit: {
                limiter: new FixedWindowRateLimiter(),
                policy: { limit: 20, windowMs: 60_000 },
            },
            rollout: { evaluator: flags, key: config.modelFlag },
        });
        return this.#agent;
    }
}
