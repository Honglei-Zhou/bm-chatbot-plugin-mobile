var glob=require('glob')
var path=require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
function resolve(dir) {
    return path.resolve(__dirname,'..',dir)
}

var files = glob.sync(resolve('src/mobileviews/**/index.js'))
var newEntries = {}
var HtmlWebpackPlugins=[]

files.forEach(function(f){
    var name = /.*\/mobileviews\/(.*)\/index\.js/.exec(f)[1]
    newEntries[name] = f
    HtmlWebpackPlugins.push(new HtmlWebpackPlugin({
        filename: resolve('dist/mobileviews/'+name+'/index.html'),
        template: resolve('src/mobileviews/'+name+'/index.html'),
        inject: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            minifyJS:true
        },
        chunks:['manifest','vendor',name]
    }))
})

module.exports={
    entry:Object.assign({},newEntries,{vendor:['jquery','vue']}),
    HtmlWebpackPlugins:HtmlWebpackPlugins
}
