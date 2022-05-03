import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
// import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter(),
		vite: {
			define: {

			}
		}
	}
};

export default config;