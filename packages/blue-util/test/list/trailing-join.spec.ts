import { describe, test, expect } from 'vitest';

import trailingJoin from '@blue/util/list/trailing-join';

describe('trailingJoin', function () {
    test('it should join a list w/ a trailing separator', function () {
        expect(trailingJoin(',', ['1', '2', '3'])).toEqual('1,2,3,');
        expect(trailingJoin(',', ['', '', ''])).toEqual(',,,');
        expect(trailingJoin(',', ['1'])).toEqual('1,');
        expect(trailingJoin(',', [''])).toEqual(',');
    });

    test('it should be curried', function () {
        const joinOnComma = trailingJoin(',');
        expect(joinOnComma).toBeInstanceOf(Function);
        expect(joinOnComma(['1', '2', '3'])).toEqual('1,2,3,');
    });
});
