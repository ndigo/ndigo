/**
 * STOMP transaction buffers: BEGIN/COMMIT/ABORT, ordered op application, and
 * the per-session op/byte bounds.
 */
import type { STOMPFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { TransactionBuffer, TransactionOp } from './_stomp-broker-types';

/** Outcome of buffering one transactional operation. */
export type TransactionAppendResult = 'appended' | 'unknown' | 'limit';

/**
 * The broker seams a transaction needs to apply buffered operations.
 */
export interface STOMPTransactionHost {
    /** Fail-closed protocol reply owned by the broker. */
    readonly fail: (session: SocketSession, frame: STOMPFrame, message: string, code?: number) => boolean;
    /** Emit a RECEIPT for a frame, when one was requested. */
    readonly receipt: (session: SocketSession, frame: STOMPFrame) => boolean;
    /** Emit a control frame (the buffered receipt at COMMIT). */
    readonly controlSend: (session: SocketSession, frame: STOMPFrame) => void;
    /** Apply one buffered SEND (authorize/onMessage/routing already ran at buffer time). */
    readonly applySend: (
        session: SocketSession,
        frame: STOMPFrame,
        op: Extract<TransactionOp, { kind: 'send' }>
    ) => Promise<boolean>;
    /** Apply one buffered ACK/NACK. */
    readonly applyAck: (session: SocketSession, op: Extract<TransactionOp, { kind: 'ack' }>) => void;
}

/** Per-session transaction bounds. */
export interface STOMPTransactionLimits {
    readonly maxTransactionsPerSession: number;
    readonly maxTransactionOps: number;
    readonly maxTransactionBytes: number;
}

/**
 * Owns the per-session transaction buffers and their apply-at-COMMIT
 * semantics (STOMP 1.2 §1.7).
 *
 * @example
 * ```ts
 * const transactions = new STOMPTransactionManager(host, limits);
 * transactions.begin(session, frame);
 * ```
 */
export class STOMPTransactionManager {
    readonly #host: STOMPTransactionHost;
    readonly #limits: STOMPTransactionLimits;
    readonly #transactions = new Map<SocketSession, Map<string, TransactionBuffer>>();

    /**
     * @param host - The broker's reply and apply seams.
     * @param limits - The per-session transaction bounds.
     */
    constructor(host: STOMPTransactionHost, limits: STOMPTransactionLimits) {
        this.#host = host;
        this.#limits = limits;
    }

    /**
     * Appends one op to an open transaction, enforcing the op/byte bounds.
     *
     * @param session - The owning session.
     * @param txId - The transaction id.
     * @param op - The buffered op.
     * @param octets - The op's retained material size.
     * @returns The append outcome.
     */
    append(session: SocketSession, txId: string, op: TransactionOp, octets: number): TransactionAppendResult {
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return 'unknown';
        }
        if (
            buffer.ops.length >= this.#limits.maxTransactionOps ||
            buffer.bytes + octets > this.#limits.maxTransactionBytes
        ) {
            return 'limit';
        }
        buffer.ops.push(op);
        buffer.bytes += octets;
        return 'appended';
    }

    /**
     * BEGIN — open a named transaction buffer.
     *
     * @param session - The session.
     * @param frame - The BEGIN frame.
     * @returns `false` on a duplicate or missing transaction id.
     */
    begin(session: SocketSession, frame: STOMPFrame): boolean {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#host.fail(session, frame, 'BEGIN requires a transaction header');
        }
        let byTx = this.#transactions.get(session);
        if (byTx === undefined) {
            byTx = new Map();
            this.#transactions.set(session, byTx);
        }
        if (byTx.has(txId)) {
            return this.#host.fail(session, frame, `transaction already active: ${txId}`);
        }
        if (byTx.size >= this.#limits.maxTransactionsPerSession) {
            return this.#host.fail(
                session,
                frame,
                `transaction limit reached (max ${this.#limits.maxTransactionsPerSession})`
            );
        }
        byTx.set(txId, { ops: [], bytes: 0 });
        return this.#host.receipt(session, frame);
    }

    /**
     * COMMIT — apply the buffered operations in order.
     *
     * @param session - The session.
     * @param frame - The COMMIT frame.
     * @returns `false` on an unknown transaction id or a failed op.
     */
    async commit(session: SocketSession, frame: STOMPFrame): Promise<boolean> {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#host.fail(session, frame, 'COMMIT requires a transaction header');
        }
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return this.#host.fail(session, frame, `unknown transaction id: ${txId}`);
        }
        const byTx = this.#transactions.get(session);
        // Ops apply in order, each send awaiting its durable append — the
        // COMMIT receipt follows, so "committed" implies "stored".
        for (const op of buffer.ops) {
            // oxlint-disable-next-line no-await-in-loop -- COMMIT applies buffered ops in order (STOMP 1.2 §1.7.1).
            if (!(await this.#applyOp(session, op, frame))) {
                byTx?.delete(txId);
                return false;
            }
        }
        byTx?.delete(txId);
        return this.#host.receipt(session, frame);
    }

    /**
     * ABORT — discard the buffered operations; their receipts are never sent.
     *
     * @param session - The session.
     * @param frame - The ABORT frame.
     * @returns `false` on an unknown transaction id.
     */
    abort(session: SocketSession, frame: STOMPFrame): boolean {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#host.fail(session, frame, 'ABORT requires a transaction header');
        }
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return this.#host.fail(session, frame, `unknown transaction id: ${txId}`);
        }
        this.#transactions.get(session)?.delete(txId);
        return this.#host.receipt(session, frame);
    }

    /**
     * Drops every transaction owned by a session.
     *
     * @param session - The disconnected session.
     */
    closeSession(session: SocketSession): void {
        this.#transactions.delete(session);
    }

    /**
     * Applies one buffered op and emits its receipt, if any.
     *
     * @param session - The owning session.
     * @param op - The op to apply.
     * @param frame - The COMMIT frame (failure attribution).
     * @returns `true` when the op applied; `false` after a fail-closed reply.
     */
    async #applyOp(session: SocketSession, op: TransactionOp, frame: STOMPFrame): Promise<boolean> {
        const receipt = op.receipt ?? null;
        if (op.kind === 'send') {
            if (!(await this.#host.applySend(session, frame, op))) {
                return false;
            }
        } else {
            this.#host.applyAck(session, op);
        }
        if (receipt !== null) {
            this.#host.controlSend(session, { command: 'RECEIPT', headers: { 'receipt-id': receipt }, body: '' });
        }
        return true;
    }
}
