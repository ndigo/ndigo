import { expectSuccess } from './_expect';
import wildcardExpression from './wildcard-expression';

describe( 'wildcardExpression', function(){
    test( 'it should parse wildcards', function(){
        expectSuccess( wildcardExpression, 'a*b', '^a.*?b$' );
        expectSuccess( wildcardExpression, 'a*b*c', '^a.*?b.*?c$' );
    } );
} );
