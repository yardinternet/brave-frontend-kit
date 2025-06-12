/**
 * Converts a string to a slug format.
 */
export const slugify = ( text: string | undefined ): string => {
	if ( ! text ) return '';
	return text
		.toString() // Cast to string (optional)
		.normalize( 'NFKD' ) // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
		.toLowerCase() // Convert the string to lowercase letters
		.trim() // Remove whitespace from both sides of a string (optional)
		.replace( /\s+/g, '-' ) // eslint-disable-line no-useless-escape
		.replace( /[^\w\-]+/g, '' ) // eslint-disable-line no-useless-escape
		.replace( /\-\-+/g, '-' ) // eslint-disable-line no-useless-escape
		.replace( /\-$/, '' ); // eslint-disable-line no-useless-escape
};
