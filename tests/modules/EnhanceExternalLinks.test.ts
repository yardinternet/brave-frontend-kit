import { describe, it, beforeEach, expect, vi } from 'vitest';
import { EnhanceExternalLinks } from '@modules/EnhanceExternalLinks';

type EnhanceExternalLinksPublic = EnhanceExternalLinks & {
	shouldIgnore: ( link: HTMLAnchorElement, href: string ) => boolean;
	insertIcon: ( link: HTMLAnchorElement ) => void;
	init: () => void;
};

describe( 'EnhanceExternalLinks', () => {
	const iconHTML = '<i class="fa-regular fa-up-right-from-square mx-2"></i>';
	let insertIconMock: vi.Mock;

	beforeEach( () => {
		document.body.innerHTML = ''; // Clean slate for each test
		vi.restoreAllMocks(); // Reset all previous spies
		insertIconMock = vi.fn();

		vi.spyOn(
			EnhanceExternalLinks.prototype as any,
			'insertIcon'
		).mockImplementation( insertIconMock );
	} );

	it( 'inserts icon only for external links', () => {
		document.body.innerHTML = `
			<a href="/internal" class="link">Internal</a>
			<a href="https://external.com" class="link">External</a>
		`;

		new EnhanceExternalLinks( {
			selector: 'a.link',
			icon: iconHTML,
		} );

		const internalLink = document.querySelector( 'a[href="/internal"]' )!;
		const externalLink = document.querySelector(
			'a[href="https://external.com"]'
		)!;

		expect( insertIconMock ).toHaveBeenCalledTimes( 1 );
		expect( insertIconMock ).toHaveBeenCalledWith( externalLink );
		expect( insertIconMock ).not.toHaveBeenCalledWith( internalLink );
	} );

	it( 'does not throw errors for invalid URLs', () => {
		document.body.innerHTML = `
			<a href="invalid-url" class="link">Invalid URL</a>
		`;

		new EnhanceExternalLinks( {
			selector: 'a.link',
			icon: iconHTML,
		} );

		const invalidLink = document.querySelector( 'a[href="invalid-url"]' )!;
		expect( invalidLink.innerHTML ).not.toContain( '<i' );
	} );

	it( 'does not insert icon if shouldIgnore returns true', () => {
		document.body.innerHTML = `
			<a href="https://internal.com" class="link">Should Ignore</a>
		`;

		class TestableEnhanceExternalLinks extends EnhanceExternalLinks {
			constructor( options = {} ) {
				super( { ...options } );
			}

			protected init() {
				super.init(); // Allow init to run the logic
			}
		}

		const instance = new TestableEnhanceExternalLinks( {
			selector: 'a.link',
			icon: iconHTML,
		} );

		// @ts-ignore
		const instanceWithTypedSpy = instance as EnhanceExternalLinksPublic;

		const shouldIgnoreMock = vi
			.spyOn( instanceWithTypedSpy, 'shouldIgnore' )
			.mockImplementation( ( link, href ) =>
				href.includes( 'internal.com' )
			);

		const localInsertIconMock = vi.fn();
		vi.spyOn( instanceWithTypedSpy, 'insertIcon' ).mockImplementation(
			localInsertIconMock
		);

		// Now execute the logic
		instanceWithTypedSpy.init();

		const ignoredLink = document.querySelector(
			'a[href="https://internal.com"]'
		)!;
		expect( shouldIgnoreMock ).toHaveBeenCalledWith(
			ignoredLink,
			'https://internal.com'
		);
		expect( localInsertIconMock ).not.toHaveBeenCalledWith( ignoredLink );
		expect( localInsertIconMock ).not.toHaveBeenCalled();
	} );
} );
