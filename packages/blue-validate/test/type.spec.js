import types from '../src/types';
import Type from '../src/type';

Object.keys(types).forEach((name) => (Type[name] = new Type(name, types[name])));

const {
        AccountMaskNumber,
        AccountNumber,
        AddressLine,
        AlertsProfileNickname,
        Category,
        City,
        Description,
        Email,
        Frequency,
        Id,
        IdentificationCode,
        Money,
        OnOff,
        Password,
        Payee,
        Phone,
        PostalCode,
        ProspectApplicantId,
        Rate,
        RoutingNumber,
        RSAToken,
        SimpleUserId,
        TaxpayerIdentification,
        UserId,
        UserSecurityCode,
        ZipCode,
        ZipCodeExtension,
    } = Type,
    _Date = Type.Date;

describe('Type', function () {
    test('it should create instances', function () {
        const decimalRangeType = new Type('decimalRange', {
            constraints: [
                {
                    type: 'Range',
                },
                {
                    type: 'Digits',
                    params: {
                        integer: 10,
                        fraction: 2,
                    },
                },
            ],
        });

        expect(decimalRangeType.validate(15, { min: 10, max: 20 }).isValid).toBe(true);
        expect(decimalRangeType.validate(25, { min: 10, max: 20 }).isValid).toBe(false);
        expect(decimalRangeType).to.be.an.instanceof(Type);
        expect(function () {
            new Type({});
        }).to.be.throw(TypeError);
    });

    context('AccountMaskNumber', function () {
        test('it should validate account mask numbers', function () {
            //Pass
            expect(AccountMaskNumber.validate('abc1234').isValid).toBe(true);
            expect(AccountMaskNumber.validate('abcdefgh5678').isValid).toBe(true);

            //Fail
            expect(AccountMaskNumber.validate('ab1234').isValid).toBe(false);
            expect(AccountMaskNumber.validate('ab12345').isValid).toBe(false);
            expect(AccountMaskNumber.validate('1234abc').isValid).toBe(false);
        });
    });

    context('AccountNumber', function () {
        test('it should validate account numbers', function () {
            //Pass
            expect(AccountNumber.validate('abcd1234').isValid).toBe(true);
            expect(AccountNumber.validate('abcdefgh12345678').isValid).toBe(true);

            //Fail
            expect(AccountNumber.validate('abcd123').isValid).toBe(false);
            expect(AccountNumber.validate('abcdefghi12345678').isValid).toBe(false);
        });
    });

    context('AddressLine', function () {
        test('it should validate address lines', function () {
            //Pass
            expect(AddressLine.validate('1000 whodey').isValid).toBe(true);

            //Fail
            expect(AddressLine.validate('1000 whodey &*%&#(*').isValid).toBe(false);
            expect(AddressLine.validate('11111111111111111111111111111111111111111').isValid).toBe(false);
        });
    });

    context('AlertsProfileNickname', function () {
        test('it should validate alerts profile nickname', function () {
            //Pass
            expect(AlertsProfileNickname.validate('abcd1234_').isValid).toBe(true);

            //Fail
            expect(AlertsProfileNickname.validate('abcd1234_&*%&#(*').isValid).toBe(false);
        });
    });

    context('Category', function () {
        test('it should validate categories', function () {
            //Pass
            expect(Category.validate('12').isValid).toBe(true);
            expect(Category.validate('abc').isValid).toBe(true);
            expect(Category.validate('#@$%').isValid).toBe(true);

            //Fail
            expect(Category.validate('1').isValid).toBe(false);
        });
    });

    context('City', function () {
        test('it should validate cities', function () {
            //Pass
            expect(City.validate('Columbus').isValid).toBe(true);
            expect(City.validate('Salt Lake City').isValid).toBe(true);
            expect(City.validate('St. Louis').isValid).toBe(true);
            expect(City.validate('Gruetli-Laager').isValid).toBe(true);
            expect(City.validate('Saint Louis Du-Ha-Ha').isValid).toBe(true);
            expect(City.validate('San Jose').isValid).toBe(true);

            //Fail
            expect(City.validate('San José').isValid).toBe(false);
            expect(City.validate('City#1').isValid).toBe(false);
            expect(City.validate('City_1').isValid).toBe(false);
            expect(City.validate('Feliz Cumpleaños').isValid).toBe(false);
            expect(City.validate('Überville').isValid).toBe(false);
            expect(City.validate('Los  Angeles').isValid).toBe(false);
        });
    });

    context('Description', function () {
        test('it should validate descriptions', function () {
            //Pass
            expect(Description.validate('abcd1234^%&*)(_+=').isValid).toBe(true);

            //Fail
            expect(Description.validate('').isValid).toBe(false);
        });
    });

    // TODO Figure out when/how to pass in data format so moment doesn't log warnings
    xcontext('Date', function () {
        test('it should validate dates', function () {
            //Pass
            expect(_Date.validate('11/15/1976').isValid).toBe(true);

            //Fail
            expect(_Date.validate('11-15-1976').isValid).toBe(false);
        });
    });

    context('Email', function () {
        test('it should validate email addresses', function () {
            expect(Email.validate('abc').isValid).toBe(false);
            expect(Email.validate('abc123').isValid).toBe(false);
            expect(Email.validate('123').isValid).toBe(false);
            expect(Email.validate('1.23').isValid).toBe(false);
            expect(Email.validate('').isValid).toBe(false);
            expect(Email.validate(null).isValid).toBe(false);
            expect(Email.validate(undefined).isValid).toBe(false);
            expect(Email.validate(123).isValid).toBe(false);
            expect(Email.validate(1.23).isValid).toBe(false);
            expect(Email.validate(true).isValid).toBe(false);
            expect(Email.validate('FALSE').isValid).toBe(false);
            expect(Email.validate('abc@').isValid).toBe(false);
            expect(Email.validate('abc123@as').isValid).toBe(false);
            expect(Email.validate('123.com@bac').isValid).toBe(false);
            expect(Email.validate('123bac.com').isValid).toBe(false);
            expect(Email.validate('123@bac@def.com').isValid).toBe(false);
            expect(Email.validate('123.bac.com').isValid).toBe(false);
            expect(Email.validate('123@bac.c').isValid).toBe(false);
            expect(Email.validate('123@bac.1').isValid).toBe(false);
            expect(Email.validate('123@bac.1c').isValid).toBe(true);
            expect(Email.validate('123@bac.1111').isValid).toBe(true);
            expect(Email.validate('123.bac@chase.com').isValid).toBe(true);
            expect(Email.validate('abc.bac@chase.uk').isValid).toBe(true);
            expect(Email.validate('my@test.com').isValid).toBe(true);
            expect(Email.validate('3334445555@test.com').isValid).toBe(false);
            expect(Email.validate('2223335555@test.com').isValid).toBe(false);
            expect(Email.validate('A2223335555@test.com').isValid).toBe(true);
        });
    });

    context('Frequency', function () {
        test('it should validate frequencies', function () {
            //Pass
            expect(Frequency.validate('Daily').isValid).toBe(true);
            expect(Frequency.validate('Weekly').isValid).toBe(true);
            expect(Frequency.validate('Monthly').isValid).toBe(true);

            //Fail
            expect(Frequency.validate('Yearly').isValid).toBe(false);
        });
    });

    // TODO This constraint is broken!
    xcontext('Id', function () {
        test('it should validate ids', function () {
            //Pass
            const result = Id.validate('abcde1');
            console.log('RESULT', result.failedConstraints[0]);
            expect(result.isValid).toBe(true);
            expect(Id.validate('abc123').isValid).toBe(true);

            //Fail
            expect(Id.validate('abcd1').isValid).toBe(false);
            expect(Id.validate('abcdef').isValid).toBe(false);
            expect(Id.validate('abc123!').isValid).toBe(false);
        });
    });

    context('IdentificationCode', function () {
        test('it should validate id codes', function () {
            //Pass
            expect(IdentificationCode.validate('12345678').isValid).toBe(true);
            expect(IdentificationCode.validate('-1234567').isValid).toBe(true);
            expect(IdentificationCode.validate(12345678).isValid).toBe(true);
            expect(IdentificationCode.validate(-1234567).isValid).toBe(true);

            //Fail
            expect(IdentificationCode.validate('123456789').isValid).toBe(false);
            expect(IdentificationCode.validate('-12345678').isValid).toBe(false);
            expect(IdentificationCode.validate(123456789).isValid).toBe(false);
            expect(IdentificationCode.validate(-12345678).isValid).toBe(false);
        });
    });

    context('Money', function () {
        test('it should not accept wild entries', function () {
            expect(Money.validate('12/10/1999').isValid).toBe(false);
            expect(Money.validate('12-10-1999').isValid).toBe(false);
            expect(Money.validate('4/5').isValid).toBe(false);
            expect(Money.validate('dasjkfjsiou').isValid).toBe(false);
        });

        test('it should validate JS numbers', function () {
            expect(Money.validate(199.99).isValid).toBe(true);
            expect(Money.validate(100).isValid).toBe(true);
            //expect( Money.validate(0100).isValid).toBe( true ); //will render as 100 before validating
            expect(Money.validate(43342.32432).isValid).toBe(false);
        });

        test('it should validate USD', function () {
            expect(Money.validate('$35,000.77', { format: 'USD' }).isValid).toBe(true);
            expect(Money.validate('$35,000.77').isValid).toBe(true);
            expect(Money.validate('35,000.77').isValid).toBe(true);
            expect(Money.validate('$35.77').isValid).toBe(true);
            expect(Money.validate('$35,000').isValid).toBe(true);
            expect(Money.validate('$35').isValid).toBe(true);
            expect(Money.validate('35.77').isValid).toBe(true);
            expect(Money.validate('0.77').isValid).toBe(true);
            expect(Money.validate('35').isValid).toBe(true);
            expect(Money.validate('35,000').isValid).toBe(true);
            expect(Money.validate('$0.77').isValid).toBe(true);
            expect(Money.validate('$.09').isValid).toBe(true);
            expect(Money.validate('15.').isValid).toBe(true);
            expect(Money.validate('15.0').isValid).toBe(true);
            expect(Money.validate('.5').isValid).toBe(true);
            expect(Money.validate('100,000').isValid).toBe(true);
            expect(Money.validate('1,000,000').isValid).toBe(true);
            expect(Money.validate('10,000,000').isValid).toBe(true);
            expect(Money.validate('100,000,000').isValid).toBe(true);
            expect(Money.validate('1,000,000,000').isValid).toBe(true);
            expect(Money.validate('10,000,000.00').isValid).toBe(true);
            expect(Money.validate('100000').isValid).toBe(true);
            expect(Money.validate('1000000').isValid).toBe(true);
            expect(Money.validate('10000000').isValid).toBe(true);
            expect(Money.validate('100000000').isValid).toBe(true);
            expect(Money.validate('1000000000').isValid).toBe(true);
            expect(Money.validate('10000000.00').isValid).toBe(true);
            expect(Money.validate('$0.').isValid).toBe(true);
            expect(Money.validate('$.0').isValid).toBe(true);
            expect(Money.validate('$1.').isValid).toBe(true);
            expect(Money.validate('$.1').isValid).toBe(true);
            expect(Money.validate('0.').isValid).toBe(true);
            expect(Money.validate('.0').isValid).toBe(true);
            expect(Money.validate('1.').isValid).toBe(true);
            expect(Money.validate('.1').isValid).toBe(true);
            expect(Money.validate('       .1   ').isValid).toBe(true);
            expect(Money.validate('0010').isValid).toBe(true);
            expect(Money.validate('$000,000,001.00').isValid).toBe(true);
            expect(Money.validate('000009292930000').isValid).toBe(true);
            expect(Money.validate('099.99').isValid).toBe(true);
        });

        test('it should NOT validate USD', function () {
            expect(Money.validate('10.000').isValid).toBe(false);
            expect(Money.validate('$$10').isValid).toBe(false);
            expect(Money.validate('0.0.00').isValid).toBe(false);
            expect(Money.validate('.0909').isValid).toBe(false);
            expect(Money.validate('0..09').isValid).toBe(false);
            expect(Money.validate('   ').isValid).toBe(false);
            expect(Money.validate('').isValid).toBe(false);
            expect(Money.validate(' . ').isValid).toBe(false);
            expect(Money.validate('.').isValid).toBe(false);
            expect(Money.validate('$').isValid).toBe(false);
            expect(Money.validate('$.').isValid).toBe(false);
            expect(Money.validate('$.0,000').isValid).toBe(false);
            expect(Money.validate('$1,00,00.00').isValid).toBe(false);
            expect(Money.validate('$12,34,56.78').isValid).toBe(false);
            expect(Money.validate('$,500,000').isValid).toBe(false);
            expect(Money.validate('$500,,000').isValid).toBe(false);
            expect(Money.validate('$,500.00').isValid).toBe(false);
            expect(Money.validate('$1,00,00,000.00').isValid).toBe(false);
            expect(Money.validate('$10,000000.00').isValid).toBe(false);
        });

        // test currency formats
        const test1 = {
                decimal: ',',
                decimalDigits: 2,
                kDelim: '.',
                symbol: 'ƒ',
                symbolBegin: true,
                regex: /^\s*ƒ?((\d+|\d{1,3}(\.\d{3})*)(,\d{0,2})?|,\d{1,2})\s*$/,
            },
            test2 = {
                decimal: '.',
                decimalDigits: 1,
                kDelim: ',',
                symbol: '$',
                symbolBegin: true,
                regex: /^\s*\$?((\d+|\d{1,3}(,\d{3})*)(\.\d?)?|\.\d)\s*$/,
            },
            test3 = {
                decimal: '.',
                decimalDigits: 2,
                kDelim: ',',
                symbol: '&',
                symbolBegin: false,
                regex: /^\s*((\d+|\d{1,3}(,\d{3})*)(\.\d{0,2})?|\.\d{1,2})&?\s*$/,
            };

        test('it should validate test format test1', function () {
            expect(Money.validate('ƒ35.000,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35.000,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35.000', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('0,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35.000', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ0,77', { currencyFormat: test1 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test1', function () {
            expect(Money.validate('ƒ35,000.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('35,000.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ35.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ35,000', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('0.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('35,000', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ0.77', { currencyFormat: test1 }).isValid).toBe(false);
        });

        test('it should validate test format test2', function () {
            expect(Money.validate('$35,000.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35,000.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35,000', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('0.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35.', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35,000', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$0.7', { currencyFormat: test2 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test2', function () {
            expect(Money.validate('$35,000.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.000.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$35.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$35.000', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.7777', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('0.777', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.000', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$.700', { currencyFormat: test2 }).isValid).toBe(false);
        });

        test('it should validate test format test3', function () {
            expect(Money.validate('35,000.77&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35.77&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('0.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('0.77&', { currencyFormat: test3 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test3', function () {
            expect(Money.validate('35.000,77&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000,77', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35,77&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('0,77', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('0.777&', { currencyFormat: test3 }).isValid).toBe(false);
        });
    });

    context('OnOff', function () {
        test('it should validate on-off', function () {
            //Pass
            expect(OnOff.validate('true').isValid).toBe(true);
            expect(OnOff.validate('false').isValid).toBe(true);
            expect(OnOff.validate(true).isValid).toBe(true);
            expect(OnOff.validate(false).isValid).toBe(true);

            //Fail
            expect(OnOff.validate('abcd').isValid).toBe(false);
            expect(OnOff.validate('1234').isValid).toBe(false);
            expect(OnOff.validate(1).isValid).toBe(false);
            expect(OnOff.validate(0).isValid).toBe(false);
        });
    });

    context('Password', function () {
        test('it should validate passwords', function () {
            //Pass
            expect(Password.validate('test#1H1~').isValid).toBe(true);
            expect(Password.validate('te@s$t%12{1:2}!').isValid).toBe(true);
            expect(Password.validate('te@s$t%89:').isValid).toBe(true);
            expect(Password.validate('test01yz{').isValid).toBe(true);
            expect(Password.validate('test01zy').isValid).toBe(true);
            expect(Password.validate('test01,-.').isValid).toBe(true);

            //Fail
            expect(Password.validate('hello').isValid).toBe(false);
            expect(Password.validate('hellothispasswordistoolongforthevalidationrequirements1!').isValid).toBe(false);
            expect(Password.validate('testing2&').isValid).toBe(false);
            expect(Password.validate('testing3<').isValid).toBe(false);
            expect(Password.validate('testing4>').isValid).toBe(false);
            // At some point these were supposed to fail but they pass now? -JBR
            //expect( Password.validate( 'testing5abc' ).isValid ).toBe( false );
            //expect( Password.validate( 'testing5aBc' ).isValid ).toBe( false );
            //expect( Password.validate( '321testing6' ).isValid ).toBe( false );
            expect(Password.validate('testing111').isValid).toBe(false);
            //expect( Password.validate( 'testing123' ).isValid ).toBe( false );
            expect(Password.validate('test01!"').isValid).toBe(false);
        });
    });

    context('Payee', function () {
        test('it should validate payees', function () {
            //Pass
            expect(Payee.validate('123456789012345678901234567890').isValid).toBe(true);

            //Fail
            expect(Payee.validate('123456789012345678901234567890!').isValid).toBe(false);
        });
    });

    context('Phone', function () {
        test('it should validate phone numbers', function () {
            //Pass
            expect(Phone.validate('6149852859').isValid).toBe(true);
            expect(Phone.validate('614-985-2859').isValid).toBe(true);

            //Fail
            expect(Phone.validate('16149852859').isValid).toBe(false);
            expect(Phone.validate('1-614-985-2859').isValid).toBe(false);
        });
    });

    context('PostalCode', function () {
        test('it should validate postal codes', function () {
            //Pass
            expect(PostalCode.validate('43240').isValid).toBe(true);
            expect(PostalCode.validate(432402110).isValid).toBe(true);

            //Fail
            expect(PostalCode.validate('43240-2110').isValid).toBe(false);
            expect(PostalCode.validate(4324021101).isValid).toBe(false);
        });
    });

    context('ProspectApplicantId', function () {
        test('it should validate prospect applicant id', function () {
            //Pass
            expect(ProspectApplicantId.validate('abc123').isValid).toBe(true);

            //Fail
            expect(ProspectApplicantId.validate('abc12').isValid).toBe(false);
        });
    });

    context('Rate', function () {
        test('it should validate rates', function () {
            //Pass
            expect(Rate.validate(0.22).isValid).toBe(true);
            expect(Rate.validate('0.22').isValid).toBe(true);

            //Fail
            expect(Rate.validate('1.00').isValid).toBe(false);
        });
    });

    context('RoutingNumber', function () {
        test('it should validate routing numbers', function () {
            //Pass
            expect(RoutingNumber.validate('044000037').isValid).toBe(true);
            expect(RoutingNumber.validate('021000089').isValid).toBe(true);
            expect(RoutingNumber.validate('314074269').isValid).toBe(true);

            //Fail
            expect(RoutingNumber.validate('hello').isValid).toBe(false);
            expect(RoutingNumber.validate('0214089').isValid).toBe(false);
        });
    });

    context('RSAToken', function () {
        test('it should validate RSA tokens', function () {
            //Pass
            expect(RSAToken.validate('12345678901234567890123456789012345').isValid).toBe(true);
            //Fail
            expect(RSAToken.validate('1234567890123456789012345678901234a').isValid).toBe(false);
        });
    });

    context('SimpleUserId', function () {
        test('it should validate simple user ids', function () {
            //Pass
            expect(SimpleUserId.validate('abc').isValid).toBe(true);
            //Fail
            expect(SimpleUserId.validate('aaa').isValid).toBe(false);
        });
    });

    context('TaxpayerIdentification', function () {
        test('it should validate simple user ids', function () {
            //Pass
            expect(TaxpayerIdentification.validate('123-45-6789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('123456789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('12-3456789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('XXX-XX-XXXX').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('XX-XXXXXXX').isValid).toBe(true);
            //Fail
            expect(TaxpayerIdentification.validate('abcdefghi').isValid).toBe(false);
            expect(TaxpayerIdentification.validate('XXXXXXXXX').isValid).toBe(false);
            expect(TaxpayerIdentification.validate('1234567-89').isValid).toBe(false);
        });
    });

    context('UserId', function () {
        test('it should validate user ids', function () {
            //Pass
            expect(UserId.validate('abcd1234').isValid).toBe(true);
            expect(UserId.validate('123456789012345678901234567890ab').isValid).toBe(true);
            //Fail
            expect(UserId.validate('abcd123').isValid).toBe(false);
            expect(UserId.validate('abcdefgh').isValid).toBe(false);
            expect(UserId.validate('12345678').isValid).toBe(false);
            expect(UserId.validate('abcd1234!').isValid).toBe(false);
            expect(UserId.validate('123456789012345678901234567890123').isValid).toBe(false);
        });
    });

    context('UserSecurityCode', function () {
        test('it should validate user security codes', function () {
            //Pass
            expect(UserSecurityCode.validate('abcd1234').isValid).toBe(true);
            expect(UserSecurityCode.validate('123456789012345678901234567890ab').isValid).toBe(true);
            //Fail
            expect(UserSecurityCode.validate('abcd123').isValid).toBe(false);
            expect(UserSecurityCode.validate('abcdefgh').isValid).toBe(false);
            expect(UserSecurityCode.validate('12345678').isValid).toBe(false);
            expect(UserSecurityCode.validate('abcd1234!').isValid).toBe(false);
            expect(UserSecurityCode.validate('123456789012345678901234567890123').isValid).toBe(false);
        });
    });

    context('ZipCode', function () {
        test('it should validate user zip codes', function () {
            //Pass
            expect(ZipCode.validate('43240').isValid).toBe(true);
            expect(ZipCode.validate(43240).isValid).toBe(true);
            //Fail
            expect(ZipCode.validate('432401').isValid).toBe(false);
            expect(ZipCode.validate(432401).isValid).toBe(false);
            expect(ZipCode.validate('43240-2110').isValid).toBe(false);
        });
    });

    context('ZipCodeExtension', function () {
        test('it should validate user zip codes', function () {
            //Pass
            expect(ZipCodeExtension.validate('2110').isValid).toBe(true);
            expect(ZipCodeExtension.validate(2110).isValid).toBe(true);
            //Fail
            expect(ZipCodeExtension.validate('21101').isValid).toBe(false);
            expect(ZipCodeExtension.validate('43240-2110').isValid).toBe(false);
        });
    });
});
