/**
 * Gets keyboard-focusable elements within a specified element.
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
 */
export const findFirstTabbable = (
	element: HTMLElement
): HTMLElement | null => {
	const tabbableElements = findTabbable( element );

	return tabbableElements.length ? tabbableElements[ 0 ] : null;
};

/**
 * Transform the tag of an element to another tag, e.g. <p> to <h2>.
 */
export const transformTag = (
	element: Element,
	transformTo: string
): HTMLElement | null => {
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
