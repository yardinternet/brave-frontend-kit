import { beforeEach, describe, expect, it, vi } from 'vitest';
import { A11yFacetWP } from '@modules/A11yFacetWP.ts';

describe( 'FacetWP', () => {
	const templateViewId = 'js-brave-facetwp-template-view';

	beforeEach( () => {
		const templateViewElement: HTMLDivElement =
			document.createElement( 'div' );
		templateViewElement.id = templateViewId;
		document.body.appendChild( templateViewElement );
	} );

	it( 'should have a default for the selectorPrefix option', () => {
		const facetWP = new A11yFacetWP();

		expect( facetWP.selectorPrefix ).toBe( 'js-brave' );
	} );

	it( 'should take selectorPrefix option', () => {
		const facetWP = new A11yFacetWP( {
			selectorPrefix: 'js',
		} );

		expect( facetWP.selectorPrefix ).toBe( 'js' );
	} );

	it( 'should add loading to tempate view on FacetWP refresh', () => {
		new A11yFacetWP();

		const facetRefreshEvent = new CustomEvent( 'facetwp-refresh' );
		document.dispatchEvent( facetRefreshEvent );

		const hasLoading: boolean =
			document
				.getElementById( templateViewId )
				?.classList.contains( 'loading' ) ?? false;

		expect( hasLoading ).toBe( true );
	} );

	it( 'should remove loading to tempate view on FacetWP loaded', () => {
		new A11yFacetWP();

		const facetLoadedEvent = new CustomEvent( 'facetwp-loaded' );
		document.dispatchEvent( facetLoadedEvent );

		const hasLoading: boolean | null =
			document
				.getElementById( templateViewId )
				?.classList.contains( 'loading' ) ?? null;

		expect( hasLoading ).toBe( false );
	} );

	it( 'should have a default for the scrollToTopOffset option', () => {
		const facetWP = new A11yFacetWP();

		expect( facetWP.scrollToTopOffset ).toBe( 150 );
	} );

	it( 'should take scrollToTopOffset option', () => {
		const facetWP = new A11yFacetWP( {
			scrollToTopOffset: 120,
		} );

		expect( facetWP.scrollToTopOffset ).toBe( 120 );
	} );

	it( 'should not scroll to top if scrollY is smaller than boxTop', () => {
		const facetWP = new A11yFacetWP();

		window.FWP = {
			loaded: true,
		};

		window.scrollY = 2;
		const boxTop = 750;

		facetWP.scrollToElementTop( boxTop );

		expect( window.scrollY ).toBe( window.scrollY );
	} );

	it( 'should not scroll to top if scrollY is smaller than boxTop', () => {
		const facetWP = new A11yFacetWP();

		window.FWP = {
			loaded: true,
		};

		window.scrollY = 800;
		const boxTop = 750;

		vi.spyOn( window, 'scrollTo' ).mockImplementation(
			( input ) => ( window.scrollY = input.top )
		);

		facetWP.scrollToElementTop( boxTop );

		// window.scrollTo should NOT have been called
		expect( window.scrollTo ).not.toHaveBeenCalled();

		// scrollY should remain unchanged
		expect( window.scrollY ).toBe( window.scrollY );
	} );

	it( 'should scroll to top if scrollY is passed than boxTop', () => {
		const facetWP = new A11yFacetWP();

		window.FWP = {
			loaded: true,
		};

		window.scrollY = 800;
		const boxTop = -100;

		const position = boxTop + window.scrollY - 150;

		vi.spyOn( window, 'scrollTo' ).mockImplementation(
			( input ) => ( window.scrollY = input.top )
		);

		facetWP.scrollToElementTop( boxTop );

		expect( window.scrollY ).toBe( position );
	} );
} );
