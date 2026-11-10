/**
 * Demo wiring: order tools plus the SSE chat controller. Both controllers are
 * registered as beans so `@routeMapping` scans their handlers.
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { ChatController } from './chat-controller';
import { OrderTools } from './order-tools';

/**
 * The lab's controller composition.
 */
@configuration
export class AgentLabConfiguration {
    readonly #chat = new ChatController();
    readonly #orders = new OrderTools();

    /**
     * @returns The SSE chat controller.
     */
    @entry()
    chatController(): ChatController {
        return this.#chat;
    }

    /**
     * @returns The shared order tool handlers.
     */
    @entry()
    orderTools(): OrderTools {
        return this.#orders;
    }
}
