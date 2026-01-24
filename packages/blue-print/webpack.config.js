const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: {
        name: {
            root: 'blue-print',
            amd: 'blue-print',
            commonjs: 'blue-print'
        },
        type: 'umd'
    },
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
