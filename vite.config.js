import { npmPackageConfig } from '@yardinternet/vite-config';
import { resolve } from 'node:path';

export default npmPackageConfig( {
	entryPoints: {
		'brave-frontend-kit': 'src/index.ts',
	},
	plugins: [
		{
			name: 'brave-frontend-kit-aliases',
			config: () => ( {
				resolve: {
					alias: {
						'@modules': resolve( import.meta.dirname, 'src/modules' ),
						'@utils': resolve( import.meta.dirname, 'src/utils' ),
					},
				},
			} ),
		},
	],
} );
