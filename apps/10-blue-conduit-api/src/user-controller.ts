/**
 * `/api/users`, `/api/users/login` and `/api/user` — registration, login and
 * the current account.
 *
 * Passwords are hashed with `@blue/auth-core`'s `DelegatingPasswordEncoder`
 * (scrypt, self-describing `{scrypt}$ln=…$salt$hash` strings), so the cost
 * parameters can move later without invalidating stored hashes. The raw
 * password is never stored, logged, or echoed.
 *
 * @module blue-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { DelegatingPasswordEncoder } from '@blue/auth-core';
import { ScryptPasswordEncoder } from '@blue/auth-core/scrypt';
import { getEnv } from '@blue/context';
import {
    getMapping,
    headerValue,
    parameters,
    postMapping,
    putMapping,
    requestMapping,
    validatedBody,
} from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { requireUser, type ConduitAuth } from './auth';
import { ConduitErrorView, type ConduitErrors } from './errors';
import { toUser } from './presenter';
import {
    loginUserSchema,
    registerUserSchema,
    updateUserSchema,
    type LoginUserBody,
    type RegisterUserBody,
    type UpdateUserBody,
} from './schemas';
import type { ConduitStore } from './store';

/** Where the duplicate-account envelope key lives. */
const ALREADY_TAKEN = ['has already been taken'];

/**
 * The user-facing auth endpoints.
 *
 * Credential failures answer `401 {"errors":{"credentials":["invalid"]}}` —
 * the shape the spec's own collection asserts for a wrong password (the spec
 * text leaves `401` vs `422` open, the collection does not).
 *
 * Duplicate registration answers `422 {"errors":{"username":[…]}}` (and/or
 * `email`) rather than the spec's `409`; see the README's conformance note for
 * both deltas.
 */
@requestMapping('/api')
export class UserController {
    readonly #store: ConduitStore;
    readonly #auth: ConduitAuth;
    readonly #passwords: DelegatingPasswordEncoder;

    /**
     * Creates the controller.
     *
     * @param store - The persistence seam.
     * @param auth - The JWT component.
     */
    constructor(store: ConduitStore, auth: ConduitAuth) {
        this.#store = store;
        this.#auth = auth;
        // Cost exponent is env-tunable so the test lane can run at a cheap
        // cost without changing the production default (OWASP's ln=17).
        const ln = Number(getEnv('BLUE_CONDUIT_SCRYPT_LN', '17'));
        this.#passwords = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder({ ln }) }, 'scrypt');
    }

    /**
     * `POST /api/users` — registers an account and returns it with a token.
     *
     * @param body - The validated `{user}` payload.
     * @returns `201 {user}` or the `422` duplicate envelope.
     */
    @postMapping('/users')
    @parameters({ body: validatedBody(registerUserSchema) })
    async register(body: RegisterUserBody) {
        const { username, email, password } = body.user;
        const errors: ConduitErrors = {};
        if (this.#store.findUserByUsername(username)) {
            errors.username = ALREADY_TAKEN;
        }
        if (this.#store.findUserByEmail(email)) {
            errors.email = ALREADY_TAKEN;
        }
        if (Object.keys(errors).length > 0) {
            return new ConduitErrorView(422, errors);
        }
        const user = this.#store.createUser({ username, email, passwordHash: this.#passwords.encode(password) });
        return ResponseEntity.created({ user: toUser(user, await this.#auth.issue(user.id, user.username)) });
    }

    /**
     * `POST /api/users/login` — exchanges credentials for a token.
     *
     * @param body - The validated `{user}` credentials.
     * @returns `200 {user}` or a `401` envelope.
     */
    @postMapping('/users/login')
    @parameters({ body: validatedBody(loginUserSchema) })
    async login(body: LoginUserBody) {
        const user = this.#store.findUserByEmail(body.user.email);
        if (!user || !this.#passwords.verify(body.user.password, user.passwordHash)) {
            return new ConduitErrorView(401, { credentials: ['invalid'] });
        }
        return { user: toUser(user, await this.#auth.issue(user.id, user.username)) };
    }

    /**
     * `GET /api/user` — the authenticated account.
     *
     * @param token - The `Authorization` header value.
     * @returns `200 {user}` or `401`.
     */
    @getMapping('/user')
    @parameters({ token: headerValue('authorization') })
    async currentUser(token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const { user } = caller;
        return { user: toUser(user, await this.#auth.issue(user.id, user.username)) };
    }

    /**
     * `PUT /api/user` — updates the authenticated account. A field the body
     * omits is left unchanged; a rename/email change is rejected with the same
     * duplicate envelope as registration.
     *
     * @param body - The validated `{user}` patch.
     * @param token - The `Authorization` header value.
     * @returns `200 {user}` with a fresh token, `401`, or `422`.
     */
    @putMapping('/user')
    @parameters({ body: validatedBody(updateUserSchema), token: headerValue('authorization') })
    async updateUser(body: UpdateUserBody, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const { user } = caller;
        const { username, email, password, bio, image } = body.user;
        const errors: ConduitErrors = {};
        if (username !== undefined && username !== user.username && this.#store.findUserByUsername(username)) {
            errors.username = ALREADY_TAKEN;
        }
        if (email !== undefined && email !== user.email && this.#store.findUserByEmail(email)) {
            errors.email = ALREADY_TAKEN;
        }
        if (Object.keys(errors).length > 0) {
            return new ConduitErrorView(422, errors);
        }
        this.#store.updateUser(user, {
            username,
            email,
            bio,
            image,
            passwordHash: password === undefined ? undefined : this.#passwords.encode(password),
        });
        // `updateUser` mutates and persists the row in place, so the token is
        // minted for the already-updated account.
        return { user: toUser(user, await this.#auth.issue(user.id, user.username)) };
    }
}
