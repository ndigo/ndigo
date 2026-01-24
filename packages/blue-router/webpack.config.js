const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: {
        name: {
            root: 'blue-router',
            amd: 'blue-router',
            commonjs: 'blue-router'
        },
        type: 'umd'
    },
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
