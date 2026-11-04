/**
 * Constructor-entry demo for `@ndigo/proxy` (AD-42 D-8): a service created by
 * the container at first `getValue` — so the interception processor weaves it
 * — whose `place` method carries `@audited` policy metadata.
 *
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { audited } from './audit-interceptor';

/**
 * Minimal order service proving container-managed method interception:
 * `place` is advised (audited), `placed` stays a plain method — both keep
 * access to the instance's private state through the woven proxy.
 */
export class OrderService {
    #placed: string[] = [];

    @audited({ action: 'order.place' })
    place(order: string): string {
        this.#placed.push(order);
        return `ok:${order}`;
    }

    placed(): readonly string[] {
        return this.#placed;
    }
}
