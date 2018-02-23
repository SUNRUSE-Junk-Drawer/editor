import {
    join as pathJoin
} from "path"

import HtmlWebpackPlugin from "html-webpack-plugin"

import ExtractTextWebpackPlugin from "extract-text-webpack-plugin"
const extractTextCss = new ExtractTextWebpackPlugin({
    filename: "index.css"
})

module.exports = {
    entry: "./src/client/index.js",
    output: {
        path: pathJoin(__dirname, "dist"),
        filename: "index.js"
    },
    module: {
        rules: [{
            test: /\.js$/, use: {
                loader: "babel-loader",
                options: {
                    presets: ["env"],
                    plugins: [["transform-react-jsx", { pragma: "picodomH" }]]
                }
            }
        },
        {
            test: /\.css$/,
            use: extractTextCss.extract({
                fallback: "style-loader",
                use: ["css-loader"]
            })
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/client/index.html",
            inject: "head",
            minify: {
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        extractTextCss
    ]
}