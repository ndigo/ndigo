import constraints from '../src/standard-constraints';

const { AddressLine, Alpha, AlphaNumeric, AlphaNumericPlus, Blank, Capitals, Characters, City, Date18YearsOld, DateRange, Digits, Email, Enum, Future, Integer, ITINRange, Length, Max, Min, Money, MustBeginWith, NotBlank, NotBeginWith, NotBeginWith1, NonConsecutiveAlphaNumerics, NonRepeatingSequence, NotPhoneEmail, Numbers, Numeric, PasswordCharacters, PasswordSymbols, Past, Pattern, PersonalName, PhoneNorthAmerica, PhoneOao, PostalCode, Range, Real, RoutingNumber, Ssn, SsnExclude, SsnOao, SsnValidGroups, Specials, Step, ZipCode, ZipCodeExtension } = constraints,
    _Boolean = constraints.Boolean,
    _Date = constraints.Date,
    _URL = constraints.URL;

describe( 'constraints', function(){
    const
        now = new Date(),
        year = now.getFullYear();

    context( 'AddressLine', function(){
        expect( AddressLine.validate( '1000 whodey' ) ).toBe( true );
        expect( AddressLine.validate( '11111111111111111111111111111111111111111' ) ).toBe( false );
        expect( AddressLine.validate( '1000 whodey &*%&#(*' ) ).toBe( false );
    } );

    context( 'Alpha', function(){
        expect( Alpha.validate( 'abc' ) ).toBe( true );
        expect( Alpha.validate( 'ABC' ) ).toBe( true );
        expect( Alpha.validate( '123' ) ).toBe( false );
        expect( Alpha.validate( 'aB12' ) ).toBe( false );
        expect( Alpha.validate( '#&$' ) ).toBe( false );
    } );

    context( 'AlphaNumeric', function(){
        expect( AlphaNumeric.validate( 'abc' ) ).toBe( true );
        expect( AlphaNumeric.validate( 'ABC' ) ).toBe( true );
        expect( AlphaNumeric.validate( '123' ) ).toBe( true );
        expect( AlphaNumeric.validate( 'aB12' ) ).toBe( true );
        expect( AlphaNumeric.validate( '#&$' ) ).toBe( false );
    } );

    context( 'AlphaNumericPlus', function(){
        expect( AlphaNumericPlus.validate( 'abc' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( 'ABC' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( '123' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( 'aB12' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( '#&$' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( 'aB12#&' ) ).toBe( true );
        expect( AlphaNumericPlus.validate( '@!;' ) ).toBe( false );
        expect( AlphaNumericPlus.validate( 'aB12#&@!' ) ).toBe( false );
    } );

    context( 'Blank', function(){
        expect( Blank.validate( '' ) ).toBe( true );
        expect( Blank.validate( 'a' ) ).toBe( false );
    } );

    context( 'Boolean', function(){
        expect( _Boolean.validate( 'true' ) ).toBe( true );
        expect( _Boolean.validate( 'FALSE' ) ).toBe( true );
        expect( _Boolean.validate( 'abc' ) ).toBe( false );
    } );

    context( 'Capitals', function(){
        expect( Capitals.validate( 'ABC' ) ).toBe( true );
        expect( Capitals.validate( 'ABCdef' ) ).toBe( true );
        expect( Capitals.validate( 'abc' ) ).toBe( false );
        expect( Capitals.validate( '!' ) ).toBe( false );
    } );

    context( 'Characters', function(){
        expect( Characters.validate( 'ABCdef' ) ).toBe( true );
        expect( Characters.validate( '!' ) ).toBe( false );
    } );

    context( 'City', function(){
        // Columbus, OH
        expect( City.validate( 'Columbus' ) ).toBe( true );
        // Cut And Shoot, TX
        expect( City.validate( 'Cut And Shoot' ) ).toBe( true );
        expect( City.validate( "',-. 1aZ" ) ).toBe( true );
        // Big Arm, MO
        expect( City.validate( 'Big  Arm' ) ).toBe( false );
        expect( City.validate( '!@#$% B' ) ).toBe( false );
    } );

    xcontext( 'ConstraintSet', function(){

    } );

    context( 'Date', function(){
        expect( _Date.validate( '11/15/1976' ) ).toBe( true );
        expect( _Date.validate( '11-15-1976' ) ).toBe( false );
    } );

    context( 'Date18YearsOld', function(){
        expect( Date18YearsOld.validate( `11/15/${ year - 19 }` ) ).toBe( true );
        expect( Date18YearsOld.validate( `11/15/${ year - 18 }` ) ).toBe( false );
        expect( Date18YearsOld.validate( `11/15/${ year }` ) ).toBe( false );
        expect( Date18YearsOld.validate( '11-15-1976' ) ).toBe( false );
    } );

    context( 'DateRange', function(){
        expect( DateRange.validate( '11/15/1976', {
            value: '11/15/1976'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
            min: '11/15/1975'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
            min: '11/15/1976'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
            max: '11/15/1976'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
            max: '11/15/1977'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
            min: '11/15/1975',
            max: '11/15/1977'
        } ) ).toBe( true );
        expect( DateRange.validate( '11/15/1976', {
           value: '11/16/1976'
        } ) ).toBe( false );
        expect( DateRange.validate( '11/15/1976', {
            min: '11/15/1977'
        } ) ).toBe( false );
        expect( DateRange.validate( '11/15/1976', {
            max: '11/15/1975'
        } ) ).toBe( false );
        expect( DateRange.validate( '11-15-1976', {
            value: '11/15/1976'
        } ) ).toBe( false );
        expect( DateRange.validate( '11/15/1976', {
            value: '11-15-1976'
        } ) ).toBe( false );
    } );

    context( 'Digits', function(){
        expect( Digits.validate( '2.5', { fraction: 1, integer: 1 } ) ).toBe( true );
        expect( Digits.validate( '1.5' ) ).toBe( false );
        expect( Digits.validate( '10.5', { fraction: 1, integer: 1 } ) ).toBe( false );
        expect( Digits.validate( '2.25', { fraction: 1, integer: 1 } ) ).toBe( false );
    } );

    context( 'Email', function(){
        expect( Email.validate( 'me@my.com' ) ).toBe( true );
        expect( Email.validate( 'me@' ) ).toBe( false );
        expect( Email.validate( 'me.com' ) ).toBe( false );
    } );

    context( 'Enum', function(){
        expect( Enum.validate( 'foo', { value: 'foo bar' } ) ).toBe( true );
        expect( Enum.validate( 'foo', { value: 'foo bar'.split( ' ' ) } ) ).toBe( true );
        expect( Enum.validate( 'foo', { value: 'bar' } ) ).toBe( false );
    } );

    context( 'Future', function(){
        expect( Future.validate( `11/15/${ year }` ) ).toBe( true );
        expect( Future.validate( '11/15/1976' ) ).toBe( false );
    } );

    context( 'Integer', function(){
        expect( Integer.validate( 123 ) ).toBe( true );
        expect( Integer.validate( '123' ) ).toBe( true );
        expect( Integer.validate( -123 ) ).toBe( true );
        expect( Integer.validate( '-123' ) ).toBe( true );
        expect( Integer.validate( '1a' ) ).toBe( false );
    } );

    context( 'ITINRange', function(){
        expect( ITINRange.validate( '900700000' ) ).toBe( true );
        expect( ITINRange.validate( '999889999' ) ).toBe( true );
        expect( ITINRange.validate( '900600000' ) ).toBe( false );
    } );

    context( 'Length', function(){
        expect( Length.validate( '123', { value: 3 } ) ).toBe( true );
        expect( Length.validate( '123', { value: 4 } ) ).toBe( false );
    } );

    context( 'Max', function(){
        expect( Max.validate( '5', { value: 6 } ) ).toBe( true );
        expect( Max.validate( '5', { value: 4 } ) ).toBe( false );
    } );

    context( 'Min', function(){
        expect( Min.validate( '5', { value: 4 } ) ).toBe( true );
        expect( Min.validate( '5', { value: 6 } ) ).toBe( false );
    } );

    context( 'Money', function(){
        expect( Money.validate( 25.25 ) ).toBe( true );
        expect( Money.validate( '1,125.25' ) ).toBe( true );
        expect( Money.validate( '$1,125.25' ) ).toBe( true );
        expect( Money.validate( '25.2525' ) ).toBe( false );
    } );

    context( 'MustBeginWith', function(){
        expect( MustBeginWith.validate( 'abc', { value: 'a' } ) ).toBe( true );
        expect( MustBeginWith.validate( 'abc', { value: 'b' } ) ).toBe( false );
    } );

    context( 'NotBlank', function(){
        expect( NotBlank.validate( 'abc' ) ).toBe( true );
        expect( NotBlank.validate( '' ) ).toBe( false );
    } );

    context( 'NotBeginWith', function(){
        expect( NotBeginWith.validate( 'abc', { value: 'b' } ) ).toBe( true );
        expect( NotBeginWith.validate( 'abc', { value: 'a' } ) ).toBe( false );
    } );

    context( 'NotBeginWith1', function(){
        expect( NotBeginWith1.validate( '456' ) ).toBe( true );
        expect( NotBeginWith1.validate( 456 ) ).toBe( true );
        expect( NotBeginWith1.validate( '123' ) ).toBe( false );
        expect( NotBeginWith1.validate( 123 ) ).toBe( false );
    } );

    context( 'NonConsecutiveAlphaNumerics', function(){
        expect( NonConsecutiveAlphaNumerics.validate( '12', { maxSequential: 3 } ) ).toBe( true );
        expect( NonConsecutiveAlphaNumerics.validate( 12, { maxSequential: 3 } ) ).toBe( true );
        expect( NonConsecutiveAlphaNumerics.validate( 'ab', { maxSequential: 3 } ) ).toBe( true );
        expect( NonConsecutiveAlphaNumerics.validate( '123', { maxSequential: 3 } ) ).toBe( false );
        expect( NonConsecutiveAlphaNumerics.validate( '321', { maxSequential: 3 } ) ).toBe( false );
        expect( NonConsecutiveAlphaNumerics.validate( 'abc', { maxSequential: 3 } ) ).toBe( false );
        expect( NonConsecutiveAlphaNumerics.validate( 'cba', { maxSequential: 3 } ) ).toBe( false );
        //expect( NonConsecutiveAlphaNumerics.validate( 123, { maxSequential: 3 } ) ).toBe( false );
    } );

    context( 'NonRepeatingAlphaNumerics', function(){
        //expect( NonRepeatingAlphaNumerics.validate( '12', { maxRepeating: 3 } ) ).toBe( true );
        //expect( NonRepeatingAlphaNumerics.validate( 12, { maxRepeating: 3 } ) ).toBe( true );
        //expect( NonRepeatingAlphaNumerics.validate( 'ab', { maxRepeating: 3 } ) ).toBe( true );
        //expect( NonRepeatingAlphaNumerics.validate( '123', { maxRepeating: 3 } ) ).toBe( false );
        //expect( NonRepeatingAlphaNumerics.validate( '321', { maxRepeating: 3 } ) ).toBe( false );
        //expect( NonRepeatingAlphaNumerics.validate( 'abc', { maxRepeating: 3 } ) ).toBe( false );
        //expect( NonRepeatingAlphaNumerics.validate( 'cba', { maxRepeating: 3 } ) ).toBe( false );
        //expect( NonRepeatingAlphaNumerics.validate( 123, { maxRepeating: 3 } ) ).toBe( false );
    } );

    context( 'NonRepeatingSequence', function(){
        expect( NonRepeatingSequence.validate( '123' ) ).toBe( true );
        expect( NonRepeatingSequence.validate( '111' ) ).toBe( false );
    } );

    context( 'NotPhoneEmail', function(){
        expect( NotPhoneEmail.validate( 'jeffrey.b.rose@jpmchase.com' ) ).toBe( true );
        expect( NotPhoneEmail.validate( '6149852859@chase.com' ) ).toBe( false );
    } );

    context( 'Numbers', function(){
        expect( Numbers.validate( '123' ) ).toBe( true );
        expect( Numbers.validate( 123 ) ).toBe( true );
        expect( Numbers.validate( 'abc123' ) ).toBe( true );
        expect( Numbers.validate( 'abc' ) ).toBe( false );
    } );

    context( 'Numeric', function(){
        expect( Numeric.validate( '123' ) ).toBe( true );
        expect( Numeric.validate( 123 ) ).toBe( true );
        expect( Numeric.validate( 'abc123' ) ).toBe( false );
        expect( Numeric.validate( 'abc' ) ).toBe( false );
    } );

    context( 'PasswordCharacters', function(){
        expect( PasswordCharacters.validate( 'aB1!#$%+/=@~' ) ).toBe( true );
        expect( PasswordCharacters.validate( '^()?' ) ).toBe( false );
        expect( PasswordCharacters.validate( 'aB1!#$%+/=@~^()?' ) ).toBe( false );
    } );

    context( 'PasswordSymbols', function(){
        expect( PasswordSymbols.validate( '!#$%+\/=@~' ) ).toBe( true );
        expect( PasswordSymbols.validate( 'aB1^()?' ) ).toBe( false );
    } );

    context( 'Past', function(){
        expect( Past.validate( '11/15/1976' ) ).toBe( true );
        expect( Past.validate( `11/15/${ year + 1 }` ) ).toBe( false );
    } );

    context( 'Pattern', function(){
        expect( Pattern.validate( 'abc', { regex: 'abc' } ) ).toBe( true );
        expect( Pattern.validate( 'Abc', { regex: 'abc', flags: 'i' } ) ).toBe( true );
    } );

    context( 'PersonalName', function(){
        expect( PersonalName.validate( "aB .'-" ) ).toBe( true );
        expect( PersonalName.validate( '"!?' ) ).toBe( false );
    } );

    context( 'PhoneNorthAmerica', function(){
        expect( PhoneNorthAmerica.validate( '6149852859' ) ).toBe( true );
        expect( PhoneNorthAmerica.validate( '614-985-2859' ) ).toBe( true );
        expect( PhoneNorthAmerica.validate( '16149852859' ) ).toBe( false );
        expect( PhoneNorthAmerica.validate( '1-614-985-2859' ) ).toBe( false );
    } );

    context( 'PhoneOao', function(){
        expect( PhoneOao.validate( '6149852859' ) ).toBe( true );
        expect( PhoneOao.validate( '614-985-2859' ) ).toBe( true );
        expect( PhoneOao.validate( '9876543210' ) ).toBe( false );
        expect( PhoneOao.validate( '987-654-3210' ) ).toBe( false );
        expect( PhoneOao.validate( '0123456789' ) ).toBe( false );
        expect( PhoneOao.validate( '012-345-6789' ) ).toBe( false );
    } );

    context( 'PostalCode', function(){
        expect( PostalCode.validate( '43240' ) ).toBe( true );
        expect( PostalCode.validate( 43240 ) ).toBe( true );
    } );

    context( 'Range', function(){
        expect( Range.validate( 5, { min: 1, max: 10 } ) ).toBe( true );
        expect( Range.validate( 5, { value: 5 } ) ).toBe( true );
        expect( Range.validate( 15, { min: 1, max: 10 } ) ).toBe( false );
        expect( Range.validate( 15, { value: 5 } ) ).toBe( false );
    } );

    context( 'Real', function(){
        expect( Real.validate( 5.0 ) ).toBe( true );
        expect( Real.validate( -5.0 ) ).toBe( true );
    } );

    context( 'RoutingNumber', function(){
        expect( RoutingNumber.validate( '044000037' ) ).toBe( true );
        expect( RoutingNumber.validate( '021000089' ) ).toBe( true );
        expect( RoutingNumber.validate( '314074269' ) ).toBe( true );
        expect( RoutingNumber.validate( '111111111' ) ).toBe( false );
    } );

    context( 'Ssn', function(){
        expect( Ssn.validate( '123456789' ) ).toBe( true );
        expect( Ssn.validate( '123-45-6789' ) ).toBe( true );
    } );

    context( 'SsnExclude', function(){
        expect( SsnExclude.validate( '123456789' ) ).toBe( false );
        expect( SsnExclude.validate( '123-45-6789' ) ).toBe( false );
        expect( SsnExclude.validate( '987654321' ) ).toBe( false );
        expect( SsnExclude.validate( '987-65-4321' ) ).toBe( false );
    } );

    context( 'SsnOao', function(){
        expect( SsnOao.validate( '111111111' ) ).toBe( false );
        expect( SsnOao.validate( '111-11-1111' ) ).toBe( false );
    } );

    context( 'SsnValidGroups', function(){
        expect( SsnValidGroups.validate( '000123456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '000-12-3456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '666123456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '666-12-3456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '900123456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '900-12-3456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '999123456' ) ).toBe( false );
        expect( SsnValidGroups.validate( '999-12-3456' ) ).toBe( false );
    } );

    context( 'Specials', function(){
        expect( Specials.validate( '@#$%' ) ).toBe( true );
    } );

    context( 'Step', function(){
        expect( Step.validate( '4', { step: 2 } ) ).toBe( true );
    } );

    context( 'URL', function(){
        expect( _URL.validate( 'http://www.chase.com/' ) ).toBe( true );
        expect( _URL.validate( 'chase' ) ).toBe( false );
    } );

    context( 'ZipCode', function(){
        expect( ZipCode.validate( '43240' ) ).toBe( true );
        expect( ZipCode.validate( 43240 ) ).toBe( true );
    } );

    context( 'ZipCodeExtension', function(){
        expect( ZipCodeExtension.validate( '1111' ) ).toBe( true );
        expect( ZipCodeExtension.validate( 1111 ) ).toBe( true );
    } );
} );
