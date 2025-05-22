import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FacetWP } from '@modules/FacetWP.ts';

describe( 'FacetWP', () => {
	const templateViewId = 'js-brave-facetwp-template-view';

	beforeEach( () => {
		const templateViewElement: HTMLDivElement =
			document.createElement( 'div' );
		templateViewElement.id = templateViewId;
		document.body.appendChild( templateViewElement );
	} );

	it( 'should have a default for the selectorPrefix option', () => {
		const facetWP = new FacetWP();

		expect( facetWP.selectorPrefix ).toBe( 'js-brave' );
	} );

	it( 'should take selectorPrefix option', () => {
		const facetWP = new FacetWP( {
			selectorPrefix: 'js',
		} );

		expect( facetWP.selectorPrefix ).toBe( 'js' );
	} );

	it( 'should add loading to tempate view on FacetWP refresh', () => {
		new FacetWP();

		const facetRefreshEvent = new CustomEvent( 'facetwp-refresh' );
		document.dispatchEvent( facetRefreshEvent );

		const hasLoading: boolean =
			document
				.getElementById( templateViewId )
				?.classList.contains( 'loading' ) ?? false;

		expect( hasLoading ).toBe( true );
	} );

	it( 'should remove loading to tempate view on FacetWP loaded', () => {
		new FacetWP();

		const facetLoadedEvent = new CustomEvent( 'facetwp-loaded' );
		document.dispatchEvent( facetLoadedEvent );

		const hasLoading: boolean | null =
			document
				.getElementById( templateViewId )
				?.classList.contains( 'loading' ) ?? null;

		expect( hasLoading ).toBe( false );
	} );

	it( 'should have a default for the scrollToTopOffset option', () => {
		const facetWP = new FacetWP();

		expect( facetWP.scrollToTopOffset ).toBe( 150 );
	} );

	it( 'should take scrollToTopOffset option', () => {
		const facetWP = new FacetWP( {
			scrollToTopOffset: 120,
		} );

		expect( facetWP.scrollToTopOffset ).toBe( 120 );
	} );

	it( 'should not scroll to top if scrollY is smaller than boxTop', () => {
		const facetWP = new FacetWP();

		window.FWP = {
			loaded: true,
		};

		window.scrollY = 2;
		const boxTop = 750;

		facetWP.scrollToTopBox( boxTop );

		expect( window.scrollY ).toBe( window.scrollY );
	} );

	it( 'should not scroll to top if scrollY is smaller than boxTop', () => {
		const facetWP = new FacetWP();

		window.FWP = {
			loaded: true,
		};

		window.scrollY = 800;
		const boxTop = 750;

		const position = boxTop - 150;

		vi.spyOn( window, 'scrollTo' ).mockImplementation(
			( input ) => ( window.scrollY = input.top )
		);

		facetWP.scrollToTopBox( boxTop );

		expect( window.scrollY ).toBe( position );
	} );
} );
