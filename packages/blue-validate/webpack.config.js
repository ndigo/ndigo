const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: {
        name: 'blue-validate',
        type: 'umd'
    },
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
