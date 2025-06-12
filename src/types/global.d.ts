export {};

declare global {
	interface Window {
		/**
		 * FacetWP uses several different JS objects to store and handle data on the front-end.
		 * The FWP object contains the bulk of FacetWP’s data and logic. It contains a mixture of functions, variables, and data objects.
		 *
		 * @see https://facetwp.com/help-center/developers/javascript-reference/js-objects-and-functions/#fwp
		 */
		FWP: {
			loaded: boolean;
			buildQueryString: () => string;
		};
	}
}
