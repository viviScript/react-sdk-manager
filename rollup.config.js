import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { visualizer } from 'rollup-plugin-visualizer';
import esbuild from 'rollup-plugin-esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);
const isProd = process.env.NODE_ENV === 'production';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const commonPlugins = [
  peerDepsExternal(),
  nodeResolve({
    extensions
  }),
  commonjs(),
  postcss({
    modules: true,
    minimize: isProd,
  }),
  esbuild({
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    sourceMap: true,
    target: 'es2015',
    jsx: 'automatic',
    jsxImportSource: 'react',
    tsconfig: 'tsconfig.json',
    minify: isProd,
    loader: 'tsx'
  }),
];

const productionPlugins = isProd
  ? [
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
      }),
    ]
  : [];

const commonConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
};

const buildConfigs = [
  // CommonJS
  {
    ...commonConfig,
    output: {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
  // ES Module
  {
    ...commonConfig,
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },
  // UMD
  {
    ...commonConfig,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'ReactSDKManager',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      sourcemap: true,
      exports: 'named',
    },
  },
];

export default buildConfigs.map(config => ({
  ...config,
  plugins: [...commonPlugins, ...productionPlugins],
})); 