import { findFirstTabbable } from '@utils/a11y.ts';

interface A11yFacetWPOptions {
	selectorPrefix?: string;
	scrollToTopOffset?: number; // Adjust this number to alter final scroll to top position
}

export class A11yFacetWP {
	private readonly selectorPrefix;
	private readonly scrollToTopOffset;

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

		// Catch up if facets already loaded, needed for Vite
		if ( window.FWP && window.FWP.loaded ) {
			this.onFacetLoad();
		}
	}

	private onFacetRefresh(): void {
		const view = document.getElementById(
			this.selectorPrefix + '-facetwp-template-view'
		);
		if ( ! view ) return;
		view.classList.add( 'loading' );
	}

	private onFacetLoad( e?: Event ): void {
		const view = document.getElementById(
			this.selectorPrefix + '-facetwp-template-view'
		);
		if ( ! view ) return;
		view.classList.remove( 'loading' );

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
			this.addAriaCurrentToPager();
			this.changeAriaLabelSelections();
			this.updatePagerRoleAttr();
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
			'.facetwp-search'
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
		const pager = document.querySelector( '.facetwp-pager' );
		if ( ! pager ) return;

		if ( pager.parentElement?.tagName.toLowerCase() === 'nav' ) {
			pager.removeAttribute( 'role' );
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
		const pagerButtons =
			document.querySelectorAll< HTMLAnchorElement >( '.facetwp-page' );
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
				this.selectorPrefix + '-facetwp-template-view'
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
			filterElement.classList.toggle( 'hidden', ! shouldShowElement );
		} );
	}

	/**
	 * Append filter group name to "Toon X meer" toggle links
	 */
	private updateShowMoreLabels(): void {
		const toggles = document.querySelectorAll(
			'.facetwp-toggle:not(.facetwp-hidden)'
		);
		toggles.forEach( ( toggle ) => {
			const match = toggle.textContent.match( /^Toon (\d+) meer$/i );

			if ( match ) {
				const legend = toggle
					.closest( 'fieldset' )
					?.querySelector( 'legend' );

				if ( ! legend ) {
					return;
				}

				const label = legend.innerText
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

	/**
	 * FacetWP adds a role="navigation" to the pager itself, which is incorrect.
	 * The role should be on the parent element that wraps the pager.
	 */
	private updatePagerRoleAttr(): void {
		const pagers = document.querySelectorAll( '.facetwp-pager' );
		pagers.forEach( ( pager ) => {
			const parent = pager.closest( '.facetwp-facet-pagination' );
			pager.removeAttribute( 'role' );
			if ( parent ) {
				parent.setAttribute( 'role', 'navigation' );
				parent.setAttribute( 'aria-label', 'Paginering' );
			}
		} );
	}
}
