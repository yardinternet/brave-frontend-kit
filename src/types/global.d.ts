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

		/**
		 * FacetWP exposes FWP_JSON for front-end data such as the query-var
		 * prefix used in pagination URLs.
		 *
		 * @see https://facetwp.com/help-center/developers/javascript-reference/js-objects-and-functions/
		 */
		FWP_JSON?: {
			prefix?: string;
		};

		/**
		 * jQuery is provided by WordPress / The Events Calendar. Typed minimally —
		 * only the `jQuery( document ).on( event, handler )` call this kit uses.
		 */
		jQuery?: ( target: Document ) => {
			on( event: string, handler: () => void ): unknown;
		};
	}
}
