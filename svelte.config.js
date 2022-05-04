import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

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
			}
		}
	}
};

export default config;