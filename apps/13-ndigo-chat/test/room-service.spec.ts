/**
 * Unit coverage for the room store's bounding and presence bookkeeping
 * (deterministic — no sockets).
 */
import { describe, expect, test } from 'vitest';
import type { SocketSession } from '@ndigo/dispatcher';
import { RoomService } from '../src/room-service';

/** A bare session-shaped object; the store keys members by identity. */
function session(): SocketSession {
    return {} as SocketSession;
}

describe('RoomService', () => {
    test('history is bounded to the newest N messages', () => {
        const rooms = new RoomService(3);
        for (let index = 1; index <= 5; index++) {
            rooms.append('lobby', { id: String(index), from: 'a', text: `m${index}`, at: index });
        }
        expect(rooms.history('lobby').map((message) => message.text)).toEqual(['m3', 'm4', 'm5']);
    });

    test('presence tracks distinct users and their sessions', () => {
        const rooms = new RoomService();
        const first = session();
        const second = session();
        rooms.join('lobby', first, 'Alice');
        rooms.join('lobby', second, 'Bob');
        expect(rooms.users('lobby')).toEqual(['Alice', 'Bob']);
        expect(rooms.memberCount('lobby')).toBe(2);

        expect(rooms.leave('lobby', first)).toBe('Alice');
        expect(rooms.users('lobby')).toEqual(['Bob']);
        expect(rooms.leave('lobby', second)).toBe('Bob');
        expect(rooms.users('lobby')).toEqual([]);
        expect(rooms.memberCount('lobby')).toBe(0);
    });

    test('the roster deduplicates repeated display names', () => {
        const rooms = new RoomService();
        rooms.join('lobby', session(), 'Alice');
        rooms.join('lobby', session(), 'Alice');
        expect(rooms.users('lobby')).toEqual(['Alice']);
        expect(rooms.memberCount('lobby')).toBe(2);
    });
});
