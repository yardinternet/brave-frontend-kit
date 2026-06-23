import { findFirstTabbable } from '@utils/a11y';

interface A11yFacetWPOptions {
	selectorPrefix?: string;
	scrollToTopOffset?: number; // Adjust this number to alter final scroll to top position
}

const SELECTORS = {
	search: '.facetwp-search',
	pager: '.facetwp-pager',
	page: '.facetwp-page',
	pageWithHref: '.facetwp-page[href]',
	pageWithData: '.facetwp-page[data-page]',
	pageActive: '.facetwp-page.active',
	selectionValue: '.facetwp-selection-value',
	toggle: '.facetwp-toggle:not(.facetwp-hidden)',
	fieldset: 'fieldset',
	legend: 'legend',
} as const;

const CLASSES = {
	loading: 'loading',
	hidden: 'hidden',
} as const;

const TEMPLATE_VIEW_ID_SUFFIX = '-facetwp-template-view';

export class A11yFacetWP {
	public readonly selectorPrefix: string;
	public readonly scrollToTopOffset: number;

	constructor( options: A11yFacetWPOptions = {} ) {
		this.selectorPrefix = options.selectorPrefix || 'js-brave';
		this.scrollToTopOffset = options.scrollToTopOffset || 150;

		this.init();
	}

	private init(): void {
		this.bindEvents();
	}

	private bindEvents(): void {
		document.addEventListener( 'facetwp-refresh', () =>
			this.onFacetRefresh()
		);
		document.addEventListener( 'facetwp-loaded', ( e: Event ) =>
			this.onFacetLoad( e )
		);

		// Pager anchors get a real href (see enhancePagerLinks), so suppress the
		// browser navigation and let FacetWP handle the click via AJAX. Guard the
		// type first: e.target can be a non-element (e.g. text node) without closest().
		document.addEventListener( 'click', ( e: MouseEvent ) => {
			const target = e.target;
			if ( ! ( target instanceof Element ) ) return;
			if ( ! target.closest( SELECTORS.pageWithHref ) ) return;

			e.preventDefault();
		} );

		// Catch up if facets already loaded, needed for Vite
		if ( window.FWP && window.FWP.loaded ) {
			this.onFacetLoad();
		}
	}

	private onFacetRefresh(): void {
		const view = document.getElementById(
			this.selectorPrefix + TEMPLATE_VIEW_ID_SUFFIX
		);
		if ( ! view ) return;
		view.classList.add( CLASSES.loading );
	}

	private onFacetLoad( e?: Event ): void {
		const view = document.getElementById(
			this.selectorPrefix + TEMPLATE_VIEW_ID_SUFFIX
		);
		if ( ! view ) return;
		view.classList.remove( CLASSES.loading );

		if ( e ) e.preventDefault();
		this.scrollToElementTop( view.getBoundingClientRect().top );
		this.addAriaLabelToSearch();
		this.changeTabFocusPager();
		this.toggleFilterLabelAndButton();
		this.updateShowMoreLabels();

		/**
		 * This timeout is necessary because otherwise it will be called too early
		 */
		setTimeout( () => {
			this.removeRoleNavigationFromPager();
			this.enhancePagerLinks();
			this.addAriaCurrentToPager();
			this.changeAriaLabelSelections();
		}, 1 );
	}

	public scrollToElementTop( elementTop: number ): void {
		if ( ! window.FWP?.loaded ) return;

		const position = elementTop + window.scrollY - this.scrollToTopOffset;

		if ( window.scrollY < position ) return; // if top box already visible

		window.scrollTo( {
			top: position,
			behavior: 'smooth',
		} );
	}

	/**
	 * A11y: Add aria-label to search input
	 */
	private addAriaLabelToSearch(): void {
		const searchInput = document.querySelector(
			SELECTORS.search
		) as HTMLInputElement | null;
		if ( ! searchInput ) return;

		const placeholder = searchInput.getAttribute( 'placeholder' );
		if ( ! placeholder ) return;

		if ( placeholder || placeholder !== '' ) {
			searchInput.setAttribute( 'aria-label', placeholder );
		} else {
			searchInput.setAttribute( 'aria-label', 'Zoek op trefwoord' );
		}
	}

	/**
	 * A11y: remove 'role=navigation' from FacetWP pager if it is inside a <nav> element.
	 */
	private removeRoleNavigationFromPager(): void {
		const pager = document.querySelector( SELECTORS.pager );
		if ( ! pager ) return;

		if ( pager.parentElement?.tagName.toLowerCase() === 'nav' ) {
			pager.removeAttribute( 'role' );
		}
	}

	/**
	 * A11y: give pager anchors a real href so role="link"/tabindex become redundant.
	 */
	private enhancePagerLinks(): void {
		const links = document.querySelectorAll< HTMLAnchorElement >(
			SELECTORS.pageWithData
		);

		links.forEach( ( link ) => {
			const page = link.getAttribute( 'data-page' );
			if ( ! page ) return;

			link.setAttribute( 'href', this.buildPagerHref( page ) );
			link.removeAttribute( 'role' );
			link.removeAttribute( 'tabindex' );
		} );
	}

	/**
	 * Build a pagination URL for the given page, preserving facet selections.
	 */
	private buildPagerHref( page: string ): string {
		const prefix = window.FWP_JSON?.prefix ?? '_';
		const param = `${ prefix }paged`;
		const url = new URL( window.location.href );

		if ( Number( page ) > 1 ) {
			url.searchParams.set( param, page );
		} else {
			url.searchParams.delete( param );
		}

		return `${ url.pathname }${ url.search }${ url.hash }`;
	}

	/**
	 * A11y: add 'aria-current' attribute to FacetWP pager.
	 */
	private addAriaCurrentToPager(): void {
		const activePage = document.querySelector( SELECTORS.pageActive );
		if ( ! activePage ) return;
		activePage.setAttribute( 'aria-current', 'page' );
	}

	/**
	 * A11y: change aria-label of selections button.
	 */
	private changeAriaLabelSelections(): void {
		const selections = document.querySelectorAll(
			SELECTORS.selectionValue
		);
		if ( selections.length === 0 ) return;

		selections.forEach( ( selection ) => {
			const label = selection.getAttribute( 'aria-label' );
			selection.setAttribute(
				'aria-label',
				label + ', verwijder deze selectie'
			);
		} );
	}

	/**
	 * A11y: change tab focus when using pager
	 */
	private changeTabFocusPager(): void {
		const pagerButtons = document.querySelectorAll< HTMLAnchorElement >(
			SELECTORS.page
		);
		if ( pagerButtons.length === 0 ) return;

		pagerButtons.forEach( ( pager ) => {
			pager.addEventListener( 'keyup', ( e: KeyboardEvent ) => {
				if ( e.key === 'Enter' ) {
					this.changeTabFocusToTemplate();
				}
			} );
		} );
	}

	private changeTabFocusToTemplate(): void {
		setTimeout( () => {
			const template = document.getElementById(
				this.selectorPrefix + TEMPLATE_VIEW_ID_SUFFIX
			);
			if ( ! template ) return;

			const firstTabbable = findFirstTabbable( template );
			firstTabbable?.focus();
		}, 500 );
	}

	/**
	 * Hide label filter and button reset filters if no filters selected
	 */
	private toggleFilterLabelAndButton(): void {
		const filterElements = document.querySelectorAll(
			`.${ this.selectorPrefix }-facetwp-filter-label, .${ this.selectorPrefix }-facetwp-btn-reset`
		);

		if ( filterElements.length === 0 ) return;

		const queryString = window.FWP?.buildQueryString();

		/**
		 * The following strings should be checked with this regex:
		 * s=searchterm
		 * s=searchterm&_paged=2
		 * s=&_paged=2
		 * _paged=2
		 */
		const shouldShowElement =
			queryString &&
			! /^_paged=\d+$|s=[^&]*&_paged=\d+$|s=[^&]*$/.test( queryString );

		filterElements.forEach( ( filterElement ) => {
			filterElement.classList.toggle(
				CLASSES.hidden,
				! shouldShowElement
			);
		} );
	}

	/**
	 * Append filter group name to "Toon X meer" toggle links
	 */
	private updateShowMoreLabels(): void {
		const toggles = document.querySelectorAll( SELECTORS.toggle );
		toggles.forEach( ( toggle ) => {
			const match = toggle.textContent.match( /^Toon (\d+) meer$/i );

			if ( match ) {
				const legend = toggle
					.closest( SELECTORS.fieldset )
					?.querySelector( SELECTORS.legend );

				if ( ! legend ) {
					return;
				}

				const label = legend.textContent
					.trim()
					.toLowerCase()
					.replace( /['’]/g, '' );

				const newLabel = `Toon ${ match[ 1 ] } meer${
					label ? ' ' + label : ''
				}`;

				toggle.textContent = newLabel;
				toggle.setAttribute( 'aria-label', newLabel );
			}
		} );
	}
}
