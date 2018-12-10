const path = require('path')
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify-es'
import pkg from './package.json'

export default {
  input: path.join(__dirname, 'src', 'index.js'),
  output: [
    {
      file: path.join(__dirname, pkg.module),
      format: 'es',
    },
    {
      file: path.join(__dirname, pkg.main),
      format: 'umd',
      name: 'perfReport',
      globals: {
        'ua-parser-js': 'UAParser',
      },
    },
  ],
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
  external: ['ua-parser-js'],
}
