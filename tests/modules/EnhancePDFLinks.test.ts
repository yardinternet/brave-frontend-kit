import { describe, it, beforeEach, expect, vi } from 'vitest';
import { EnhancePDFLinks } from '@modules/EnhancePDFLinks';

describe( 'EnhancePDFLinks', () => {
	let iconHTML = '<i class="fa-regular fa-up-right-from-square mx-2"></i>';
	let xhrMock: any;

	beforeEach( () => {
		document.body.innerHTML = `
			<a href="file.pdf" class="pdf-link">PDF Link</a>
			<a href="/file.pdf" class="excluded">Excluded PDF</a>
		`;

		xhrMock = {
			open: vi.fn(),
			send: vi.fn(),
			readyState: 4,
			status: 200,
			getResponseHeader: vi.fn( ( header ) => {
				if ( header === 'Content-Type' ) return 'application/pdf';
				if ( header === 'Content-Length' ) return '102400'; // Mock file size in bytes
				return null;
			} ),
			onreadystatechange: vi.fn(),
		};

		vi.stubGlobal( 'XMLHttpRequest', function () {
			return xhrMock;
		} );
	} );

	it( 'adds icon and appends file size', async () => {
		const instance = new EnhancePDFLinks( {
			selector: 'a.pdf-link',
			icon: iconHTML,
			showFileSize: true,
		} );

		xhrMock.onreadystatechange = vi.fn( () => {
			const link = document.querySelector( '.pdf-link' )!;
			const fileSize = xhrMock.getResponseHeader( 'Content-Length' );
			const sizeInKB =
				( parseInt( fileSize, 10 ) / 1024 ).toFixed( 1 ) + ' KB';
			link.innerHTML += ` (${ sizeInKB })`;
		} );

		xhrMock.onreadystatechange();

		// Wait for the DOM to update
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		const enhancedLink = document.querySelector( '.pdf-link' )!;
		expect( enhancedLink.innerHTML ).toContain( 'i' );
		expect( enhancedLink.innerHTML ).toMatch( /\(\d+(\.\d{1,1})?\sKB\)/ );
	} );

	it( 'respects excludedClasses', () => {
		const instance = new EnhancePDFLinks( {
			selector: 'a',
			icon: iconHTML,
			excludedClasses: [ 'excluded' ],
		} );

		const excluded = document.querySelector( '.excluded' );
		expect( excluded?.innerHTML ).not.toContain( 'i' );
	} );
} );
