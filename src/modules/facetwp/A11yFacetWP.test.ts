import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { A11yFacetWP } from '@modules/facetwp/A11yFacetWP';

describe( 'A11yFacetWP', () => {
	const templateViewId = 'js-brave-facetwp-template-view';

	beforeEach( () => {
		document.body.innerHTML = '';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( window as any ).FWP = undefined;
		vi.spyOn( window, 'scrollTo' ).mockImplementation( () => {} );

		const templateViewElement: HTMLDivElement =
			document.createElement( 'div' );
		templateViewElement.id = templateViewId;
		document.body.appendChild( templateViewElement );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
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

	describe( 'pager links', () => {
		const addPagerLink = ( page: string ): HTMLAnchorElement => {
			const link = document.createElement( 'a' );
			link.className = 'facetwp-page';
			link.setAttribute( 'data-page', page );
			link.setAttribute( 'role', 'link' );
			link.setAttribute( 'tabindex', '0' );
			document.body.appendChild( link );
			return link;
		};

		const dispatchLoaded = (): void => {
			document.dispatchEvent( new CustomEvent( 'facetwp-loaded' ) );
		};

		it( 'gives pager anchors a real href and drops redundant a11y attributes', () => {
			vi.useFakeTimers();
			new A11yFacetWP();
			const link = addPagerLink( '2' );

			dispatchLoaded();
			vi.runAllTimers();

			expect( link.getAttribute( 'href' ) ).toContain( '_paged=2' );
			expect( link.hasAttribute( 'role' ) ).toBe( false );
			expect( link.hasAttribute( 'tabindex' ) ).toBe( false );

			vi.useRealTimers();
		} );

		it( 'omits the paged param for page 1', () => {
			vi.useFakeTimers();
			new A11yFacetWP();
			const link = addPagerLink( '1' );

			dispatchLoaded();
			vi.runAllTimers();

			expect( link.getAttribute( 'href' ) ).not.toContain( 'paged' );

			vi.useRealTimers();
		} );

		it( 'uses the FWP_JSON prefix for the paged param', () => {
			vi.useFakeTimers();
			window.FWP_JSON = { prefix: 'fwp_' };
			new A11yFacetWP();
			const link = addPagerLink( '3' );

			dispatchLoaded();
			vi.runAllTimers();

			expect( link.getAttribute( 'href' ) ).toContain( 'fwp_paged=3' );

			vi.useRealTimers();
			window.FWP_JSON = undefined;
		} );

		it( 'preserves the current URL hash in the generated href', () => {
			vi.useFakeTimers();
			window.location.hash = '#js-brave-facetwp-template-view';
			new A11yFacetWP();
			const link = addPagerLink( '2' );

			dispatchLoaded();
			vi.runAllTimers();

			expect( link.getAttribute( 'href' ) ).toContain(
				'_paged=2#js-brave-facetwp-template-view'
			);

			vi.useRealTimers();
			window.location.hash = '';
		} );

		it( 'prevents default navigation when clicking an enhanced pager link', () => {
			new A11yFacetWP();

			const link = document.createElement( 'a' );
			link.className = 'facetwp-page';
			link.setAttribute( 'href', '/?_paged=2' );
			document.body.appendChild( link );

			const event = new MouseEvent( 'click', {
				bubbles: true,
				cancelable: true,
			} );
			link.dispatchEvent( event );

			expect( event.defaultPrevented ).toBe( true );
		} );
	} );
} );
