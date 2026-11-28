/**
 * Host wiring for the STOMP client collaborators.
 */
import type { Signal } from '@ndigo/signals';
import type { AsyncReader } from './async-reader.js';
import type { SocketClient, SocketStatus } from './socket-client-types.js';
import type { STOMPClientOptions } from './stomp-client-types.js';
import { STOMPProtocolError, type STOMPFrame } from './stomp-frame.js';
import type { STOMPSubscriptionHost, STOMPSubscriptionRegistry } from './_stomp-client-subscriptions.js';
import type { STOMPSendHost, STOMPSendTracker } from './_stomp-client-sends.js';
import type { STOMPHandshake } from './_stomp-client-handshake.js';
import type { Handshake } from './_stomp-client-internal.js';
import type { STOMPFrameRouter } from './_stomp-client-frames.js';
import type { STOMPConnectorHost } from './_stomp-client-connector.js';
import type { STOMPLifecycleHost } from './_stomp-client-lifecycle.js';
import type { STOMPFailHost } from './_stomp-client-fail.js';

/** The client state the collaborator hosts read through. */
export interface STOMPClientCore {
    /** The underlying socket. */
    readonly socket: SocketClient;
    /** CONNECT headers and lifecycle policy. */
    readonly options: STOMPClientOptions;
    /** Reactive connected state. */
    readonly connected: Signal<boolean>;
    /** Subscription registry. */
    readonly subscriptions: STOMPSubscriptionRegistry;
    /** Receipt and buffered-send tracker. */
    readonly sends: STOMPSendTracker;
    /** CONNECT handshake tracker. */
    readonly handshake: STOMPHandshake;
    /** Completed on session end. */
    readonly closedReader: AsyncReader<void>;
    /** Per-subscription queue bound. */
    readonly maxSubscriptionMessages: number;
    /** Whether the session ended. */
    isDone(): boolean;
    /** Sets the terminal session flag. */
    setDone(value: boolean): void;
    /** The current epoch. */
    currentEpoch(): number;
    /** Bumps the epoch for a superseding connection. */
    bumpEpoch(): void;
    /** Runs the CONNECT pass. */
    onOpen(): Promise<void>;
    /** Fails the session. */
    fail(message: string): void;
    /** Serializes and sends a frame. */
    sendFrame(frame: STOMPFrame): void;
}

/** The host objects bound to one client core. */
export interface STOMPClientHosts {
    /** Subscription registry host. */
    readonly subscriptionHost: STOMPSubscriptionHost;
    /** Send tracker host. */
    readonly sendHost: STOMPSendHost;
    /** Frame router callbacks. */
    readonly router: STOMPFrameRouter;
    /** CONNECT open-flow host. */
    readonly connectorHost: STOMPConnectorHost;
    /** Socket-status watcher host. */
    readonly lifecycleHost: STOMPLifecycleHost;
    /** Terminal-failure host. */
    readonly failHost: STOMPFailHost;
}

/**
 * Builds the collaborator host objects for a client core.
 *
 * @param core - The client state and actions.
 * @returns The hosts, all reading live core state.
 */
export function createSTOMPClientHosts(core: STOMPClientCore): STOMPClientHosts {
    const isConnected = (): boolean => core.connected.value;
    const isDone = (): boolean => core.isDone();

    const sessionEnded = (): void => {
        core.connected.value = false;
        core.sends.settleAll(new STOMPProtocolError('connection closed'));
        core.sends.drainPending();
        // Terminal session: drop the registry so a late `subscribe()`
        // throws instead of registering a stream that can never receive
        // frames (the entries' readers are already completed above).
        core.subscriptions.completeAll();
        core.closedReader.complete();
    };

    const hosts: STOMPClientHosts = {
        subscriptionHost: {
            get connected(): boolean {
                return isConnected();
            },
            get maxSubscriptionMessages(): number {
                return core.maxSubscriptionMessages;
            },
            sendFrame: (frame: STOMPFrame): void => core.sendFrame(frame),
        },
        sendHost: {
            get connected(): boolean {
                return isConnected();
            },
            get done(): boolean {
                return isDone();
            },
            sendFrame: (frame: STOMPFrame): void => core.sendFrame(frame),
        },
        router: {
            onConnected: (): void => {
                core.connected.value = true;
                // Settle the handshake deferred: the awaiting open pass
                // resumes on the microtask queue to re-SUBSCRIBE + flush.
                core.handshake.settle();
            },
            onMessage: (frame): void => core.subscriptions.route(frame),
            onReceipt: (receiptId): void => core.sends.resolve(receiptId),
            onError: (message): void => core.fail(message),
        },
        connectorHost: {
            get options(): STOMPClientOptions {
                return core.options;
            },
            get done(): boolean {
                return isDone();
            },
            get epoch(): number {
                return core.currentEpoch();
            },
            socketUrl: core.socket.url,
            isSocketOpen: (): boolean => core.socket.status.value === 'open',
            beginHandshake: (epoch): Handshake => core.handshake.begin(epoch),
            clearHandshake: (handshake): void => core.handshake.clear(handshake),
            sendFrame: (frame): void => core.sendFrame(frame),
            resubscribe: (): void => core.subscriptions.resubscribe(hosts.subscriptionHost),
            flushPending: (): void => core.sends.flushPending(),
            fail: (message): void => core.fail(message),
        },
        lifecycleHost: {
            get status(): SocketStatus {
                return core.socket.status.value;
            },
            get done(): boolean {
                return isDone();
            },
            reconnect: core.options.reconnect,
            shouldOpen: (): boolean => !isDone(),
            scheduleOpen: (): void => {
                // Defer out of the effect's synchronous scope: the open pass
                // reads signals, and an in-scope read would make the effect
                // re-run on every CONNECTED flip — a second CONNECT on the
                // same transport.
                queueMicrotask(() => {
                    if (!isDone()) {
                        // Never leave the pass an orphaned promise: an
                        // unexpected throw here would be an unhandled
                        // rejection and would strand the session half-open.
                        core.onOpen().catch((error: unknown) => {
                            core.fail(error instanceof Error ? error.message : 'stomp session error');
                        });
                    }
                });
            },
            reconnecting: (): void => {
                core.bumpEpoch();
                core.handshake.abort();
                core.connected.value = false;
                // A SEND frame that left the dropped transport can never be
                // receipted by the new STOMP session; frames still buffered
                // keep their promises and go out on the new session.
                core.sends.settleSent();
                // A new transport connection is a new STOMP session: every
                // entry must be re-SUBSCRIBEd after the next CONNECTED.
                core.subscriptions.markPending();
            },
            closed: (): void => {
                core.bumpEpoch();
                core.handshake.abort();
                core.setDone(true);
                sessionEnded();
            },
            end: (): void => {
                core.setDone(true);
                sessionEnded();
            },
            sessionEnded,
        },
        failHost: {
            endSession: (): void => {
                core.setDone(true);
                core.bumpEpoch();
            },
            abortHandshake: (): void => core.handshake.abort(),
            disconnected: (): void => {
                core.connected.value = false;
            },
            settleReceipts: (error): void => core.sends.settleAll(error),
            drainPending: (): void => core.sends.drainPending(),
            completeSubscriptions: (): void => core.subscriptions.completeAll(),
            completeClosed: (): void => core.closedReader.complete(),
            notifyError: (message): void => {
                try {
                    core.options.onError?.(message);
                } catch {
                    // Observer faults must never break the client.
                }
            },
        },
    };
    return hosts;
}
