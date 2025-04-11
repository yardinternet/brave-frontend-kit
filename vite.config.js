import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( () => {
	const isWatchMode = process.env.WATCH === 'true';

	return {
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
	};
} );
