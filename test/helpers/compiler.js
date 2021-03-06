import path from 'path';

import del from 'del';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

const modules = (config) => {
  return {
    rules: config.rules
      ? config.rules
      : config.loader
        ? [
            {
              test: config.loader.test || /\.js$/,
              use: {
                loader: path.resolve(__dirname, '../../lib'),
                options: config.loader.options || {},
              },
            },
          ]
        : [],
  };
};

const plugins = (config) => [].concat(config.plugins || []);

const output = (config) => {
  return {
    path: path.resolve(
      __dirname,
      `../outputs/${config.output ? config.output : ''}`
    ),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  };
};

export default function(fixture, config, options) {
  config = {
    bail: true,
    devtool: config.devtool || 'source-map',
    context: process.cwd(),
    entry: path.resolve(__dirname, '../fixtures', fixture),
    output: output(config),
    mode: 'development',
    module: modules(config),
    optimization: {
      runtimeChunk: true,
    },
    plugins: plugins(config),
    stats: 'verbose',
  };

  options = Object.assign({ output: false }, options);

  if (options.output) del.sync(config.output.path);

  const compiler = webpack(config);

  if (!options.output) compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    })
  );
}
