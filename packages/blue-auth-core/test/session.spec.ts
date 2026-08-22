/**
 * @author Jeff Rose
 */

import { describe, test, expect } from 'vitest';
import { DefaultSession, AnonymousPrincipal } from '../src/index';

describe('DefaultSession', () => {
    test('starts unauthenticated', () => {
        const session = new DefaultSession();
        expect(session.isAuthenticated).toBe(false);
        expect(session.principal).toBeNull();
        expect(session.token).toBeNull();
    });

    test('setPrincipal marks session as authenticated', () => {
        const session = new DefaultSession();
        const principal = new AnonymousPrincipal();

        session.setPrincipal(principal, 'token-123');

        expect(session.isAuthenticated).toBe(true);
        expect(session.principal).toBe(principal);
        expect(session.token).toBe('token-123');
    });

    test('clear resets to unauthenticated state', () => {
        const session = new DefaultSession();
        session.setPrincipal(new AnonymousPrincipal(), 'token-456');
        expect(session.isAuthenticated).toBe(true);

        session.clear();

        expect(session.isAuthenticated).toBe(false);
        expect(session.principal).toBeNull();
        expect(session.token).toBeNull();
    });
});