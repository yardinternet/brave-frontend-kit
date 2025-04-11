/**
 * The element has visibility: hidden, which makes it initially un-focusable, creating an error.
 * This ensures a wait until it can activate the trap.
 */
export const checkCanFocusTrap = (
	elements: HTMLElement[],
	intervalTime: number = 5
): Promise< void[] > => {
	const results = elements.map( ( element ) => {
		return new Promise< void >( ( resolve ) => {
			const interval = setInterval( () => {
				if ( getComputedStyle( element ).visibility !== 'hidden' ) {
					resolve();
					clearInterval( interval );
				}
			}, intervalTime );
		} );
	} );
	return Promise.all( results );
};
