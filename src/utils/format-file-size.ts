/**
 * Converts a number of bytes into a human-readable file size string.
 */
export const formatFileSize = ( bytes: number ): string => {
	const units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
	let i = 0;

	while ( bytes >= 1024 && i < units.length - 1 ) {
		bytes /= 1024;
		i++;
	}

	return `${ bytes.toFixed( 0 ) } ${ units[ i ] }`;
};
