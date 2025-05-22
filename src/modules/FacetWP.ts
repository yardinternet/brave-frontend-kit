import { findFirstTabbable } from '@utils/helpers.ts';

export class FacetWP {
	#options;

	constructor( options = {} ) {
		this.#options = options;

		this.init();
	}

	private init() {
		this.bindEvents();
	}

	private bindEvents(): void {
		document.addEventListener( 'facetwp-refresh', () =>
			this.onFacetRefresh()
		);
		document.addEventListener( 'facetwp-loaded', ( e ) =>
			this.onFacetLoad( e )
		);
	}

	private onFacetRefresh(): void {
		const view = document.getElementById( 'js-facetwp-template-view' );
		if ( ! view ) return;
		view.classList.add( 'loading' );
	}

	private onFacetLoad( e: Event ): void {
		const view = document.getElementById( 'js-facetwp-template-view' );
		if ( ! view ) return;
		view.classList.remove( 'loading' );

		this.scrollToTop( e, view );
		this.addAriaLabelToSearch();
		this.changeTabFocusPager();
		this.toggleFilterLabelAndButton();

		/**
		 * This timeout is necessary because otherwise it will be called too early
		 */
		setTimeout( () => {
			this.addAriaCurrentToPager();
			this.changeAriaLabelSelections();
		}, 1 );
	}

	private scrollToTop( e: Event, view: HTMLElement ): void {
		e.preventDefault();

		const offset = 150; // Adjust this number to alter final scroll position
		const scrollPosition =
			view.getBoundingClientRect().top + window.scrollY - offset;

		if ( ( window as any ).FWP.loaded ) {
			// Only scrollToTop if the user has scrolled down a bit
			if ( window.scrollY < scrollPosition + 300 ) return;

			window.scrollTo( {
				top: scrollPosition,
				behavior: 'smooth',
			} );
		}
	}

	/**
	 * A11y: Add aria-label to search input
	 */
	private addAriaLabelToSearch(): void {
		const searchInput = document.querySelector(
			'.facetwp-search'
		) as HTMLElement | null;
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
	 * A11y: add 'aria-current' attribute to FacetWP pager.
	 */
	private addAriaCurrentToPager(): void {
		const activePage = document.querySelector( '.facetwp-page.active' );
		if ( ! activePage ) return;
		activePage.setAttribute( 'aria-current', 'page' );
	}

	/**
	 * A11y: change aria-label of selections button.
	 */
	private changeAriaLabelSelections(): void {
		const selections = document.querySelectorAll(
			'.facetwp-selection-value'
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
		const pagerButtons = document.querySelectorAll( '.facetwp-page' );
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
				'js-facetwp-template-view'
			);
			const firstTabbable = findFirstTabbable( template );
			firstTabbable?.focus();
		}, 500 );
	}

	/**
	 * Hide label filter and button reset filters if no filters selected
	 */
	private toggleFilterLabelAndButton(): void {
		const filterElements = document.querySelectorAll(
			'.js-facetwp-filter-label, .js-facetwp-btn-reset'
		);

		if ( filterElements.length === 0 ) return;

		const queryString = ( window as any ).FWP.buildQueryString();

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
			filterElement.classList.toggle( 'hidden', ! shouldShowElement );
		} );
	}
}
