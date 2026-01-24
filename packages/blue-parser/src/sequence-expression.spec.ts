import { expectFailure, expectSuccess } from './_expect';
import sequenceExpression from './sequence-expression';

const { between, char } = require( 'arcsecond' );

describe( 'sequenceExpression', function(){
    test( 'it should handle ascending sequences', function(){
        expectSuccess( sequenceExpression, 'A..D', [ 'A', 'B', 'C', 'D' ] );
        expectSuccess( sequenceExpression, '1..4', [ '1', '2', '3', '4' ] );
        expectSuccess( sequenceExpression, 'a..Z', [ 'a', '`', '_', '^', ']', '\\', '[', 'Z' ] );
        expectSuccess( sequenceExpression, 'A..z', [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ] );
    } );

    test( 'it should handle descending sequences', function(){
        expectSuccess( sequenceExpression, '5..1', [ '5', '4', '3', '2', '1' ] );
        expectSuccess( sequenceExpression, 'd..a', [ 'd', 'c', 'b', 'a' ] );
    } );

    test( 'it should handle negative numbers', function(){
        expectSuccess( sequenceExpression, '2..-2', [ '2', '1', '0', '-1', '-2' ] );
        expectSuccess( sequenceExpression, '-50..-0..5', [ '-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0' ] );
        expectSuccess( sequenceExpression, '-1..-4', [ '-1', '-2', '-3', '-4' ] );
        expectSuccess( sequenceExpression, '-1..1', [ '-1', '0', '1' ] );
    } );

    test( 'it should handle steps', function(){
        expectSuccess( sequenceExpression, '1..10..2', [ '1', '3', '5', '7', '9' ] );
        expectSuccess( sequenceExpression, '1..5..1', [ '1', '2', '3', '4', '5' ] );
        expectSuccess( sequenceExpression, '5..1..1', [ '5', '4', '3', '2', '1' ] );
        expectSuccess( sequenceExpression, '5..1..-1', [ '5', '4', '3', '2', '1' ] );
        expectSuccess( sequenceExpression, 'a..F..2', [ 'a', '_', ']', '[', 'Y', 'W', 'U', 'S', 'Q', 'O', 'M', 'K', 'I', 'G' ] );
        expectSuccess( sequenceExpression, 'A..f..02', [ 'A', 'C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y', '[', ']', '_', 'a', 'c', 'e' ] );
    } );

    test( 'it should handle padding', function(){
        const result = [ '01', '02', '03', '04' ];
        expectSuccess( sequenceExpression, '01..04', result );
        expectSuccess( sequenceExpression, '1..04', result );
        expectSuccess( sequenceExpression, '01..4', result );
        expectSuccess( sequenceExpression, '003..001', [ '003', '002', '001' ] );
        expectSuccess( sequenceExpression, '00..03', [ '00', '01', '02', '03' ] );
        expectSuccess( sequenceExpression, '-01..03', [ '-01', '000', '001', '002', '003' ] );
        expectSuccess( sequenceExpression, '1..05..3', [ '01', '04' ] );
        expectSuccess( sequenceExpression, '01..100', [ '001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036', '037', '038', '039', '040', '041', '042', '043', '044', '045', '046', '047', '048', '049', '050', '051', '052', '053', '054', '055', '056', '057', '058', '059', '060', '061', '062', '063', '064', '065', '066', '067', '068', '069', '070', '071', '072', '073', '074', '075', '076', '077', '078', '079', '080', '081', '082', '083', '084', '085', '086', '087', '088', '089', '090', '091', '092', '093', '094', '095', '096', '097', '098', '099', '100' ] );
        expectSuccess( sequenceExpression, '-10..00', [ '-10', '-09', '-08', '-07', '-06', '-05', '-04', '-03', '-02', '-01', '000' ] );
        expectSuccess( sequenceExpression, '0001..-5..-2', [ '0001', '-001', '-003', '-005' ] );
    } );

    test( 'it should work within other parsers', function(){
        const betweenBraces = between( char( '(' ) )( char( ')' ) );
        expectSuccess( betweenBraces( sequenceExpression ), '(-10..00)', [ '-10', '-09', '-08', '-07', '-06', '-05', '-04', '-03', '-02', '-01', '000' ] );
        expectSuccess( betweenBraces( sequenceExpression ), '(d..a)', [ 'd', 'c', 'b', 'a' ] );
    } );

    test( 'it should return semantic errors', function(){
        expectFailure( sequenceExpression, '&..9', 'ParseError (position 0): Expecting a sequence point, which can be a digit, with optional padding, or letter' );
        expectFailure( sequenceExpression, '0-9', "ParseError (position 1): Expecting '..'" );
    } );
} );
