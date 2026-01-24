const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: 'blue-core',
    libraryTarget: 'umd',
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
