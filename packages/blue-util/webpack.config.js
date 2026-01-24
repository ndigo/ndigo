const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' ),
    { assign } = Object;

indexConfig = assign( {}, webpackConfig, {
    output: {
        globalObject: 'globalThis',
        library: {
            name: {
                root: 'blue-util',
                amd: 'blue-util',
                commonjs: 'blue-util'
            },
            type: 'umd'
        },
        path: path.resolve( __dirname, '' )
    }
} );

module.exports = [ indexConfig ];
