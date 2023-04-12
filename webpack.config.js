import { resolve, dirname } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const config = {
  mode: "development",
  resolve: {
    fallback: { 
      zlib: require.resolve("browserify-zlib"),
      url: require.resolve("url"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      assert: require.resolve("assert/"),
      util: require.resolve("util/")
    },
    extensions: [".tsx", ".ts", ".js"]
  },
  stats: "errors-warnings",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    server: "https"
  },
  entry: "./src/client.tsx",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/"
  },
  devtool: "source-map",
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        loader: "ts-loader" 
      },
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.ogg$/,
        use: "file-loader"
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: "[name]-[local]"
              }
            }
          }
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      favicon: "public/favicon.ico"
    })
  ]
};

export default config;