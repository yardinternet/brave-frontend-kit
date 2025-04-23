import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( () => {
	const isWatchMode = process.env.WATCH === 'true';

	return {
		resolve: {
			alias: {
				'@modules': resolve( __dirname, 'src/modules' ),
				'@utils': resolve( __dirname, 'src/utils' ),
			},
		},
		build: {
			lib: {
				entry: resolve( __dirname, 'src/index.ts' ),
				name: 'BraveFrontendTools',
			},
			watch: isWatchMode
				? {
						include: 'src/**',
				  }
				: null,
		},
		test: {
			environment: 'jsdom',
		},
	};
} );
