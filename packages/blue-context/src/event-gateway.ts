/**
 * @author Jeff Rose
 */

import { FrameworkError } from '@blue/core';
import type { EventType } from './event-emitter';
import type { ApplicationContext } from './context';

export interface ContextEventRelay {
    from: EventType;
    to: EventType;
}

export interface RelayValidationResult {
    readonly relay: ContextEventRelay;
    readonly valid: boolean;
    readonly reason?: string;
}

export interface RelayValidationStrategy {
    validate(relay: ContextEventRelay): RelayValidationResult;
}

export interface GatewayDiagnosticHandler {
    onRelayBlocked?(result: RelayValidationResult): void;
    onRelayRegistered?(relay: ContextEventRelay): void;
}

export interface ContextEventGatewayOptions {
    diagnosticHandler?: GatewayDiagnosticHandler;
    throwOnInvalid?: boolean;
    validationStrategy?: RelayValidationStrategy;
}

export interface NamespaceRelayValidationOptions {
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

    constructor(options: NamespaceRelayValidationOptions = {}) {
        this.featureNamespace = options.featureNamespace;
    }

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

    constructor(message: string) {
        super(message);
        this.name = 'InvalidRelayError';
    }
}

export class ContextEventGateway {
    #connected: boolean;
    #blockedRelays: RelayValidationResult[];
    #diagnosticHandler?: GatewayDiagnosticHandler;
    #relayedEventCount: number;
    #subscriptions: Array<{ eventType: EventType; listener: (...data: any[]) => void }>;
    #throwOnInvalid: boolean;
    #validationStrategy: RelayValidationStrategy;

    destroyed: boolean;
    readonly relays: ContextEventRelay[];
    readonly source: ApplicationContext;
    readonly target: ApplicationContext;

    get blockedRelays(): readonly RelayValidationResult[] {
        return this.#blockedRelays;
    }

    get activeRelayCount(): number {
        return this.relays.length;
    }

    get blockedRelayCount(): number {
        return this.#blockedRelays.length;
    }

    get relayedEventCount(): number {
        return this.#relayedEventCount;
    }

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

    hasBlockedRelays(): boolean {
        return this.#blockedRelays.length > 0;
    }

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

    #createRelayListener(eventType: EventType): (...data: any[]) => void {
        return (...data: any[]) => {
            this.#relayedEventCount++;
            this.target.emit(eventType, ...data);
        };
    }
}
