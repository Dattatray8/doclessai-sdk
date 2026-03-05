import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/loader.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: 'dist/loader.standalone.js',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  jsx: 'automatic',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  }
})