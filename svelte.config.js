import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

import nodeResolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
      fallback: 'index.html'
    }),
		prerender: {
			default: true
		},
		vite: {
			resolve: {
				alias: {
					util: 'util'
				}
			},
			optimizeDeps: {
				esbuildOptions: {
					define: {
						global: 'globalThis'
					},
					plugins: [
						NodeGlobalsPolyfillPlugin({
							process: true,
							buffer: true
						}),
						NodeModulesPolyfillPlugin()
					]
				}
			},
			build: {
				minify: false,
        rollupOptions: {
					plugins: [
						nodePolyfills({
							browser: true,
							preferBuiltins: true
						}),
						nodeResolve(),
					]
				}
    	}
		}
	}
};

export default config;