import { describe, it, expect, test } from 'vitest';
import toPipedString from '../src/to-piped-string';

describe('toPipedString', function () {
    const parsed = {
            segg: 'PHP',
            zip: '43021-8143',
            ECI: '0005354248',
            RPC: ['0510', '0474'],
            locale: 'en_us',
            pfid: '22382446',
            segment: 'PHP',
            AOC: ['6654', '6272'],
            pm: ['MMA', 'HMG', 'BAC', 'CHK', 'ATM'],
            apc: ['100', '100', '010', '010', '010', '010', '080', '080', '070'],
            empty: '',
            undef: undefined,
        },
        pipedString = toPipedString(parsed);

    test('it should create a piped string', function () {
        //expect( pipedString ).toBe( 'segg=PHP|zip=43021-8143|ECI=0005354248|RPC=0510,0474,|locale=en_us|pfid=22382446|segment=PHP|AOC=6654,6272,|pm=MMA,HMG,BAC,CHK,ATM,|apc=100,100,010,010,010,010,080,080,070,|empty=|undef|' );
        expect(pipedString).toBe(
            'segg%3DPHP|zip%3D43021-8143|ECI%3D0005354248|RPC%3D0510%252C0474%252C|locale%3Den_us|pfid%3D22382446|segment%3DPHP|AOC%3D6654%252C6272%252C|pm%3DMMA%252CHMG%252CBAC%252CCHK%252CATM%252C|apc%3D100%252C100%252C010%252C010%252C010%252C010%252C080%252C080%252C070%252C|empty%3D|undef|'
        );
    });
});
