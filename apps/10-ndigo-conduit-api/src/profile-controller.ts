/**
 * `/api/profiles/:username` and its `follow` sub-resource.
 *
 * Reading a profile is optional-auth (the spec's "Auth is optional"), but the
 * `following` member is view-relative: it is `true` only when the caller
 * actually follows the profile. Follow/unfollow are idempotent, so a retried
 * request cannot flip the flag back.
 *
 * @module ndigo-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    deleteMapping,
    getMapping,
    headerValue,
    parameters,
    pathVariable,
    postMapping,
    requestMapping,
} from '@ndigo/dispatcher';
import { optionalUser, requireUser, type ConduitAuth } from './auth';
import { notFound } from './errors';
import { toProfile } from './presenter';
import type { ConduitStore } from './store';
import type { User } from './entities';

/** The profiles controller. */
@requestMapping('/api/profiles')
export class ProfileController {
    readonly #store: ConduitStore;
    readonly #auth: ConduitAuth;

    /**
     * Creates the controller.
     *
     * @param store - The persistence seam.
     * @param auth - The JWT component.
     */
    constructor(store: ConduitStore, auth: ConduitAuth) {
        this.#store = store;
        this.#auth = auth;
    }

    /**
     * `GET /api/profiles/:username` — a profile plus the caller's follow state.
     *
     * @param username - The profile's username.
     * @param token - The `Authorization` header value.
     * @returns `200 {profile}`, `401`, or `404`.
     */
    @getMapping('/:username')
    @parameters({ username: pathVariable('username'), token: headerValue('authorization') })
    async profile(username: string, token: string | undefined) {
        const caller = await optionalUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const user = this.#store.findUserByUsername(username);
        if (!user) {
            return notFound('profile');
        }
        return { profile: toProfile(user, this.follows(caller.user, user)) };
    }

    /**
     * `POST /api/profiles/:username/follow` — follows the account (idempotent).
     *
     * @param username - The profile to follow.
     * @param token - The `Authorization` header value.
     * @returns `200 {profile}`, `401`, or `404`.
     */
    @postMapping('/:username/follow')
    @parameters({ username: pathVariable('username'), token: headerValue('authorization') })
    async follow(username: string, token: string | undefined) {
        return this.changeFollow(username, token, true);
    }

    /**
     * `DELETE /api/profiles/:username/follow` — unfollows the account (idempotent).
     *
     * @param username - The profile to unfollow.
     * @param token - The `Authorization` header value.
     * @returns `200 {profile}`, `401`, or `404`.
     */
    @deleteMapping('/:username/follow')
    @parameters({ username: pathVariable('username'), token: headerValue('authorization') })
    async unfollow(username: string, token: string | undefined) {
        return this.changeFollow(username, token, false);
    }

    /**
     * Whether the viewer follows the account (never true anonymously).
     *
     * @param viewer - The caller, or `null`.
     * @param target - The profile account.
     * @returns `true` when the follow edge exists.
     */
    private follows(viewer: User | null, target: User): boolean {
        return viewer !== null && this.#store.isFollowing(viewer.id, target.id);
    }

    /**
     * Shared follow/unfollow body: resolve the caller, find the target, apply
     * the edge, answer with the resulting profile.
     *
     * @param username - The profile's username.
     * @param token - The `Authorization` header value.
     * @param followed - Whether the edge should exist after the call.
     * @returns `200 {profile}`, `401`, or `404`.
     */
    private async changeFollow(username: string, token: string | undefined, followed: boolean) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const target = this.#store.findUserByUsername(username);
        if (!target) {
            return notFound('profile');
        }
        if (followed) {
            this.#store.follow(caller.user.id, target.id);
        } else {
            this.#store.unfollow(caller.user.id, target.id);
        }
        return { profile: toProfile(target, this.follows(caller.user, target)) };
    }
}
