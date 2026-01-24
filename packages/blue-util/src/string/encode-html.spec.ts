import encodeHTML from './encode-html';

describe( 'encodeHTML', function(){

    test( 'it should convert special chars into entities', function(){
        expect( encodeHTML( '<em>\'lorem\'</em> & "ipsum"' ) ).toBe( '&lt;em&gt;&#39;lorem&#39;&lt;&#x2F;em&gt; &amp; &quot;ipsum&quot;' );
    } );

} );
