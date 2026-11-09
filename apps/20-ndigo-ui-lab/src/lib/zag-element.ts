/**
 * Adapts a Zag.js machine to a custom element lifecycle.
 *
 * The controller is deliberately unaware of markup: components pass a props
 * factory, a connect function, and a render function. That keeps every
 * primitive a small binding instead of a bespoke machine integration.
 */
import type { Machine, MachineSchema, Service } from '@zag-js/core';
import { VanillaMachine } from '@zag-js/vanilla';

/**
 * Wiring for one Zag machine inside a custom element.
 */
export interface ZagElementOptions<T extends MachineSchema, A> {
    /** Machine factory from the component's `@zag-js/*` package. */
    readonly machine: Machine<T>;
    /** Connects a running service to the API the render function consumes. */
    readonly connect: (service: Service<T>) => A;
    /** Initial props; later changes go through `updateProps`. */
    readonly props: () => Partial<NonNullable<T['props']>>;
    /** Applies the connected API to the element's parts. */
    readonly render: (api: A) => void;
}

/**
 * Lifecycle handle returned by {@link createZagElement}.
 */
export interface ZagElementController<T extends MachineSchema, A> {
    /** Latest connected API, or `undefined` before the first start. */
    readonly api: A | undefined;
    /** Whether the machine is currently running. */
    readonly started: boolean;
    /** Starts the machine and performs the first render. */
    start(): void;
    /** Stops the machine and releases its subscriptions and effects. */
    stop(): void;
    /** Replaces machine props without restarting. */
    updateProps(props: Partial<NonNullable<T['props']>>): void;
    /** Sends an event to the machine. */
    send(event: T['event']): void;
}

/**
 * Creates a controller that binds a Zag machine to an element.
 * @param options - Machine, connect function, props factory, and renderer.
 * @returns A controller with start/stop/updateProps/send.
 */
export function createZagElement<T extends MachineSchema, A>(
    options: ZagElementOptions<T, A>
): ZagElementController<T, A> {
    let machine: VanillaMachine<T> | undefined;
    let api: A | undefined;
    let unsubscribe: (() => void) | undefined;

    return {
        get api() {
            return api;
        },
        get started() {
            return machine !== undefined;
        },
        start() {
            if (machine) return;
            const instance = new VanillaMachine(options.machine, options.props());
            const publish = (service: Service<T>) => {
                api = options.connect(service);
                options.render(api);
            };
            machine = instance;
            unsubscribe = instance.subscribe(publish);
            instance.start();
            publish(instance.service);
        },
        stop() {
            unsubscribe?.();
            unsubscribe = undefined;
            machine?.stop();
            machine = undefined;
            api = undefined;
        },
        updateProps(props) {
            machine?.updateProps(props);
        },
        send(event) {
            machine?.send(event);
        },
    };
}
