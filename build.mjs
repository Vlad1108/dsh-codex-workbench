import { build } from 'esbuild'
import { transform } from 'lightningcss'
import { readFile } from 'node:fs/promises'

const name = 'dsh-codex-workbench'
const cssModules = {
  name: 'css-modules',
  setup(builder) {
    builder.onLoad({ filter: /\.module\.css$/ }, async args => {
      const result = transform({ filename: args.path, code: await readFile(args.path), cssModules: true })
      const classes = Object.fromEntries(Object.entries(result.exports ?? {}).map(([key, entry]) => [key, entry.name]))
      return { contents: `export default ${JSON.stringify(classes)}; export const styleText = ${JSON.stringify(result.code.toString())};`, loader: 'js' }
    })
  },
}

await build({
  entryPoints: ['src/index.ts'], outfile: 'lib/index.js', platform: 'node', format: 'esm',
  bundle: true, packages: 'external', target: 'node22', tsconfigRaw: {},
})
await build({
  entryPoints: ['src/client/index.tsx'], outfile: 'lib/client.js', platform: 'browser', format: 'cjs',
  bundle: true, target: 'es2022', jsx: 'automatic', plugins: [cssModules],
  tsconfigRaw: {},
  external: ['react', 'react/jsx-runtime', 'react-dom', '@deepseek-ai/dsh-client-ui-primitives'],
  banner: { js: `window.__ModuleLoader__.load({id:${JSON.stringify(name)},factory:(require)=>{const module={exports:{}};const exports=module.exports;` },
  footer: { js: 'return module.exports;}});' },
})
