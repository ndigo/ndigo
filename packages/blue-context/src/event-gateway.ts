import { FrameworkError } from '@blue/core';
import type { EventType } from './event-emitter';
import type { ApplicationContext } from './context';

/**
 * Maps an event emitted by the source context to a target event.
 */
export interface ContextEventRelay {
    /**
     * The source event type.
     */
    from: EventType;
    /**
     * The target event type.
     */
    to: EventType;
}

/**
 * Result of validating a relay registration.
 */
export interface RelayValidationResult {
    /**
     * The relay that was validated.
     */
    readonly relay: ContextEventRelay;
    /**
     * Whether the relay is allowed.
     */
    readonly valid: boolean;
    /**
     * Human-readable reason for rejection, when invalid.
     */
    readonly reason?: string;
}

/**
 * Validates relay registrations before they are attached.
 */
export interface RelayValidationStrategy {
    /**
     * Validates a relay definition.
     *
     * @param relay - The relay to validate.
     * @returns The validation result.
     */
    validate(relay: ContextEventRelay): RelayValidationResult;
}

/**
 * Receives relay registration and blocking diagnostics.
 */
export interface GatewayDiagnosticHandler {
    /**
     * Called when a relay is rejected.
     *
     * @param result - The blocked relay result.
     */
    onRelayBlocked?(result: RelayValidationResult): void;
    /**
     * Called when a relay is accepted.
     *
     * @param relay - The accepted relay.
     */
    onRelayRegistered?(relay: ContextEventRelay): void;
}

/**
 * Configures relay validation and diagnostics for a gateway.
 */
export interface ContextEventGatewayOptions {
    /**
     * Optional diagnostic callback sink.
     */
    diagnosticHandler?: GatewayDiagnosticHandler;
    /**
     * Throws instead of silently blocking invalid relays.
     */
    throwOnInvalid?: boolean;
    /**
     * Strategy used to validate relays.
     */
    validationStrategy?: RelayValidationStrategy;
}

/**
 * Options for namespace-based relay validation.
 */
export interface NamespaceRelayValidationOptions {
    /**
     * Optional feature namespace allowed in addition to `site`.
     */
    featureNamespace?: string;
}

const namespacePattern = /^([a-z][a-z0-9-]*):.+$/;

const getEventTypeLabel = (eventType: EventType): string => {
    return typeof eventType === 'symbol' ? eventType.toString() : eventType;
};

const parseNamespace = (eventType: EventType): string | undefined => {
    if (typeof eventType !== 'string') {
        return undefined;
    }

    const matches = namespacePattern.exec(eventType);
    return matches ? matches[1] : undefined;
};

/**
 * Permissive relay validator that accepts all relays.
 */
export class PermissiveRelayValidationStrategy implements RelayValidationStrategy {
    /**
     * Accepts every relay without additional checks.
     *
     * @param relay - The relay to validate.
     * @returns A successful validation result.
     */
    validate(relay: ContextEventRelay): RelayValidationResult {
        return {
            relay,
            valid: true,
        };
    }
}

/**
 * Namespace-based relay validator for `site:*` and `<feature>:*` contracts.
 */
export class NamespaceRelayValidationStrategy implements RelayValidationStrategy {
    readonly featureNamespace?: string;

    /**
     * Creates a namespace validator.
     *
     * @param options - Validation options.
     */
    constructor(options: NamespaceRelayValidationOptions = {}) {
        this.featureNamespace = options.featureNamespace;
    }

    /**
     * Validates that both relay endpoints use allowed namespaces.
     *
     * @param relay - The relay to validate.
     * @returns The validation result.
     */
    validate(relay: ContextEventRelay): RelayValidationResult {
        if (typeof relay.from === 'symbol' || typeof relay.to === 'symbol') {
            return {
                relay,
                valid: true,
            };
        }

        const fromNamespace = parseNamespace(relay.from),
            toNamespace = parseNamespace(relay.to);

        if (!fromNamespace) {
            return {
                relay,
                valid: false,
                reason: `Event '${getEventTypeLabel(relay.from)}' must follow '<namespace>:<event>' format`,
            };
        }

        if (!toNamespace) {
            return {
                relay,
                valid: false,
                reason: `Event '${getEventTypeLabel(relay.to)}' must follow '<namespace>:<event>' format`,
            };
        }

        const allowedNamespaces = this.featureNamespace ? new Set(['site', this.featureNamespace]) : new Set(['site']);

        if (!allowedNamespaces.has(fromNamespace)) {
            return {
                relay,
                valid: false,
                reason: `Source namespace '${fromNamespace}' is not allowed`,
            };
        }

        if (!allowedNamespaces.has(toNamespace)) {
            return {
                relay,
                valid: false,
                reason: `Target namespace '${toNamespace}' is not allowed`,
            };
        }

        return {
            relay,
            valid: true,
        };
    }
}

/**
 * Error thrown when a relay is rejected and throw-on-invalid mode is enabled.
 */
export class InvalidRelayError extends FrameworkError {
    get [Symbol.toStringTag](): string {
        return 'InvalidRelayError';
    }

    /**
     * Creates an invalid-relay error.
     *
     * @param message - The error message.
     */
    constructor(message: string) {
        super(message);
    }
}

/**
 * Relays selected events from one application context to another.
 */
export class ContextEventGateway {
    #connected: boolean;
    #blockedRelays: RelayValidationResult[];
    #diagnosticHandler?: GatewayDiagnosticHandler;
    #relayedEventCount: number;
    #subscriptions: Array<{ eventType: EventType; listener: (...data: unknown[]) => void }>;
    #throwOnInvalid: boolean;
    #validationStrategy: RelayValidationStrategy;

    destroyed: boolean;
    readonly relays: ContextEventRelay[];
    readonly source: ApplicationContext;
    readonly target: ApplicationContext;

    /**
     * The relays rejected by validation.
     */
    get blockedRelays(): readonly RelayValidationResult[] {
        return this.#blockedRelays;
    }

    /**
     * The number of accepted relays.
     */
    get activeRelayCount(): number {
        return this.relays.length;
    }

    /**
     * The number of rejected relays.
     */
    get blockedRelayCount(): number {
        return this.#blockedRelays.length;
    }

    /**
     * The number of events forwarded by this gateway.
     */
    get relayedEventCount(): number {
        return this.#relayedEventCount;
    }

    /**
     * Creates a gateway that relays selected events between contexts.
     *
     * @param source - The source context.
     * @param target - The target context.
     * @param relays - Initial relay mappings.
     * @param options - Gateway validation and diagnostic options.
     */
    constructor(
        source: ApplicationContext,
        target: ApplicationContext,
        relays: ContextEventRelay[] = [],
        options: ContextEventGatewayOptions = {}
    ) {
        this.#connected = false;
        this.#blockedRelays = [];
        this.#diagnosticHandler = options.diagnosticHandler;
        this.#relayedEventCount = 0;
        this.#subscriptions = [];
        this.#throwOnInvalid = options.throwOnInvalid ?? false;
        this.#validationStrategy = options.validationStrategy ?? new PermissiveRelayValidationStrategy();
        this.destroyed = false;
        this.relays = [];
        this.source = source;
        this.target = target;

        for (const relay of relays) {
            this.addRelay(relay.from, relay.to);
        }

        this.connect();
    }

    /**
     * Registers a relay mapping.
     *
     * @param from - The source event type.
     * @param to - The target event type.
     * @returns This gateway.
     */
    addRelay(from: EventType, to: EventType = from): this {
        const relay = { from, to },
            result = this.#validationStrategy.validate(relay);

        if (!result.valid) {
            this.#blockedRelays.push(result);
            this.#diagnosticHandler?.onRelayBlocked?.(result);

            if (this.#throwOnInvalid) {
                throw new InvalidRelayError(result.reason ?? 'Relay registration failed');
            }

            return this;
        }

        this.relays.push(relay);
        this.#diagnosticHandler?.onRelayRegistered?.(relay);

        if (this.#connected) {
            const listener = this.#createRelayListener(to);
            this.source.on(from, listener);
            this.#subscriptions.push({ eventType: from, listener });
        }

        return this;
    }

    /**
     * Returns whether any relays have been rejected.
     *
     * @returns `true` when blocked relays exist.
     */
    hasBlockedRelays(): boolean {
        return this.#blockedRelays.length > 0;
    }

    /**
     * Connects all registered relays to the source context.
     *
     * @returns This gateway.
     */
    connect(): this {
        if (this.#connected || this.destroyed) {
            return this;
        }

        for (const relay of this.relays) {
            const listener = this.#createRelayListener(relay.to);
            this.source.on(relay.from, listener);
            this.#subscriptions.push({ eventType: relay.from, listener });
        }

        this.#connected = true;
        return this;
    }

    /**
     * Disconnects all relay listeners and marks the gateway destroyed.
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        for (const subscription of this.#subscriptions) {
            this.source.off(subscription.eventType, subscription.listener);
        }

        this.#subscriptions = [];
        this.#connected = false;
        this.destroyed = true;
    }

    #createRelayListener(eventType: EventType): (...data: unknown[]) => void {
        return (...data: unknown[]) => {
            this.#relayedEventCount++;
            this.target.emit(eventType, ...data);
        };
    }
}
