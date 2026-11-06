/**
 * The session: who is signed in, and the JWT every authenticated call carries.
 *
 * The service is the single owner of the session state — a `@ndigo/signals`
 * signal for the in-memory snapshot plus the persisted token — so the auth
 * interceptor, the auth guard, the settings form and every view read one
 * source of truth. Mutations refresh the current route (AD-53 D-3: services
 * call `router.refresh()` instead of driving a second render path), which is
 * how a follow/favorite/login change reaches the DOM.
 *
 * Failures never throw at the caller: a rejected write records the API's
 * envelope in {@link FormErrorState} and refreshes, so the form re-renders with
 * its per-field messages.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ROUTER } from '@ndigo/router';
import { signal, type Signal } from '@ndigo/signals';
import {
    ConduitApiError,
    type ConduitAccountPatch,
    type ConduitApi,
    type ConduitErrors,
    type ConduitSession,
    type ConduitUser,
} from '../lib/api/conduit-types';
import { FormErrorState, type FormId } from './form-errors';

/** The `localStorage` key the JWT is persisted under. */
export const CONDUIT_TOKEN_KEY = 'conduit.jwt';

/** The session slice every view model carries. */
export interface ConduitSessionModel {
    isAuthenticated: boolean;
    user: ConduitUser | null;
}

/**
 * Token persistence.
 *
 * Browser storage access is wrapped because it throws in private-mode Safari
 * and in a sandboxed iframe; a session then simply does not survive a reload
 * instead of breaking the app. Nothing else in the app touches `localStorage`.
 */
export class ConduitTokenStorage {
    readonly #key: string;

    /**
     * Creates the store.
     *
     * @param key - The storage key (overridable for tests).
     */
    constructor(key: string = CONDUIT_TOKEN_KEY) {
        this.#key = key;
    }

    /** The persisted JWT, or `null` when none is stored. */
    get token(): string | null {
        try {
            return globalThis.localStorage?.getItem(this.#key) ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Persists or removes the JWT.
     *
     * @param token - The token to store, or `null` to forget it.
     */
    write(token: string | null): void {
        try {
            if (token === null) {
                globalThis.localStorage?.removeItem(this.#key);
            } else {
                globalThis.localStorage?.setItem(this.#key, token);
            }
        } catch {
            // Storage unavailable: the in-memory session still works.
        }
    }
}

/**
 * The authenticated-user service.
 */
export class SessionService extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    readonly #api: ConduitApi;
    readonly #storage: ConduitTokenStorage;
    readonly #session: Signal<ConduitSession | null>;
    readonly #errors: FormErrorState;

    /**
     * Creates the service.
     *
     * @param api - The Conduit API port.
     * @param storage - Token persistence.
     * @param initial - A session to start from (tests); the token is not persisted.
     */
    constructor(api: ConduitApi, storage: ConduitTokenStorage, initial: ConduitSession | null = null) {
        super();
        this.#api = api;
        this.#storage = storage;
        this.#session = signal(initial);
        this.#errors = new FormErrorState();
    }

    /** The current session, or `null` for an anonymous visitor. */
    get session(): ConduitSession | null {
        return this.#session.value;
    }

    /** The current account, or `null` for an anonymous visitor. */
    get user(): ConduitUser | null {
        return this.#session.value?.user ?? null;
    }

    /** The JWT the auth interceptor stamps onto outgoing requests. */
    get token(): string | null {
        return this.#session.value?.token ?? this.#storage.token;
    }

    /** Whether a session is established. */
    get isAuthenticated(): boolean {
        return this.#session.value !== null;
    }

    /**
     * The session slice for a view model.
     *
     * @returns The authenticated flag and account.
     */
    toModel(): ConduitSessionModel {
        return { isAuthenticated: this.isAuthenticated, user: this.user };
    }

    /**
     * The envelope a form failed with, when that form produced it.
     *
     * @param form - The form being rendered.
     * @returns The envelope, or `null`.
     */
    errorsFor(form: FormId): ConduitErrors | null {
        return this.#errors.for(form);
    }

    /**
     * Restores a session from the persisted token by asking the API who it
     * belongs to (`GET /api/user`).
     *
     * A token the API rejects is forgotten — the `401` interceptor has already
     * dropped the in-memory session by then.
     */
    async restore(): Promise<void> {
        if (this.#storage.token === null) {
            return;
        }
        try {
            this.#accept(await this.#api.currentUser());
        } catch {
            this.#forget();
        }
    }

    /**
     * Signs in with credentials. On success the visitor lands on the home feed.
     *
     * @param input - The login credentials (`email` + `password`).
     * @returns The recorded envelope on failure, `null` on success.
     */
    async login(input: { email: string; password: string }): Promise<ConduitErrors | null> {
        return this.#submit(
            'login',
            () => this.#api.login(input),
            () => void this.#navigate('/')
        );
    }

    /**
     * Registers an account and signs it in.
     *
     * @param input - The registration fields.
     * @returns The recorded envelope on failure, `null` on success.
     */
    async register(input: { username: string; email: string; password: string }): Promise<ConduitErrors | null> {
        return this.#submit(
            'register',
            () => this.#api.register(input),
            () => void this.#navigate('/')
        );
    }

    /**
     * Patches the signed-in account. On success the visitor keeps their place
     * (the settings page re-renders with the saved values).
     *
     * @param patch - The changed fields.
     * @returns The recorded envelope on failure, `null` on success.
     */
    async update(patch: ConduitAccountPatch): Promise<ConduitErrors | null> {
        return this.#submit(
            'settings',
            () => this.#api.updateUser(patch),
            () => undefined
        );
    }

    /** Signs out, drops the token, and returns to the home feed. */
    logout(): void {
        this.#forget();
        void this.#navigate('/');
    }

    /**
     * Drops the session without navigating (the `401` interceptor's hook,
     * paired with its own redirect).
     */
    dropSession(): void {
        this.#forget();
    }

    /**
     * Runs a write, records its envelope, and refreshes the route either way.
     *
     * @param form - The form being submitted.
     * @param write - The API call.
     * @param onSuccess - Runs after the session is accepted.
     * @returns The envelope on failure, `null` on success.
     */
    async #submit(
        form: FormId,
        write: () => Promise<ConduitSession>,
        onSuccess: () => void
    ): Promise<ConduitErrors | null> {
        this.#errors.clear();
        try {
            this.#accept(await write());
            onSuccess();
            this.#refresh();
            return null;
        } catch (error) {
            const errors = ConduitApiError.from(error)?.errors ?? { body: ['Sign-in failed.'] };
            this.#errors.set(form, errors);
            this.#refresh();
            return errors;
        }
    }

    /**
     * Stores and adopts a session returned by the API.
     *
     * @param session - The `{user}` payload, including its token.
     */
    #accept(session: ConduitSession): void {
        this.#session.value = session;
        this.#storage.write(session.token);
    }

    /** Forgets the session in memory and in storage. */
    #forget(): void {
        this.#session.value = null;
        this.#storage.write(null);
    }

    /** Re-renders the current route so its model picks up the new session. */
    #refresh(): void {
        this.applicationContext?.getValue(ROUTER)?.refresh();
    }

    /**
     * Navigates programmatically, falling back to the hash when no router is
     * registered yet (a service used outside the composed runtime).
     *
     * @param path - The absolute app path, e.g. `/`.
     */
    async #navigate(path: string): Promise<void> {
        const router = this.applicationContext?.getValue(ROUTER);
        if (router?.navigate) {
            await router.navigate(path);
            return;
        }
        globalThis.location.hash = `#${path}`;
    }
}
