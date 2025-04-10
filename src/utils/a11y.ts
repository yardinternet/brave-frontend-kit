/**
 * Gets keyboard-focusable elements within a specified element.
 *
 * @param {HTMLElement} element The element to search within.
 * @return {HTMLElement[]} Array of focusable elements
 */
export const findTabbable = ( element: HTMLElement ): HTMLElement[] => {
	const tabbableElements = element.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);

	const array = Array.from( tabbableElements ) as HTMLElement[];

	return array.filter(
		( el: HTMLElement ) =>
			! el.hasAttribute( 'disabled' ) &&
			! el.getAttribute( 'aria-hidden' ) &&
			el.style.display !== 'none'
	);
};

/**
 * Gets the first keyboard-focusable element within a specified element.
 *
 * @param {HTMLElement} element The element to search within.
 * @return {HTMLElement|null} The first focusable element
 */
export const findFirstTabbable = (
	element: HTMLElement
): HTMLElement | null => {
	const tabbableElements = findTabbable( element );

	return tabbableElements.length ? tabbableElements[ 0 ] : null;
};

/**
 * Transform the tag of an element to another tag, e.g. <p> to <h2>.
 *
 * @param {Element} element     The element to transform
 * @param {string}  transformTo Tag to transform to (e.g. 'h2')
 * @return {HTMLElement|null} Transformed element
 */
export const transformTag = ( element: Element, transformTo: string ) => {
	if ( ! element ) return null;

	const transformedElement = document.createElement( transformTo );

	transformedElement.innerHTML = element.innerHTML;

	for ( let i = 0; i < element.attributes.length; i++ ) {
		transformedElement.setAttribute(
			element.attributes[ i ].name,
			element.attributes[ i ].value
		);
	}

	if ( ! element.parentNode ) return transformedElement;

	element.parentNode.replaceChild( transformedElement, element );

	return transformedElement;
};

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
