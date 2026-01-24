const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

Reflect.deleteProperty( webpackConfig, 'externals' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: 'blue-demo',
    libraryTarget: 'umd',
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
