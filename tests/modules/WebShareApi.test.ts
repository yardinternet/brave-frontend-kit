import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { WebShareApi } from '@modules/WebShareApi';

describe( 'WebShareApi', () => {
	let originalShare: typeof navigator.share;

	beforeEach( () => {
		document.body.innerHTML = '';
		originalShare = navigator.share;
	} );

	afterEach( () => {
		( navigator as any ).share = originalShare;
		vi.restoreAllMocks();
	} );

	it( 'hides buttons if navigator.share is not available', () => {
		document.body.innerHTML = `
			<button class="js-web-share-api" data-title="Share Title" data-text="Share Text" data-url="https://example.com">Share</button>
		`;

		( navigator as any ).share = undefined;

		new WebShareApi( { selector: '.js-web-share-api' } );

		const button = document.querySelector(
			'.js-web-share-api'
		) as HTMLButtonElement;
		expect( button.style.display ).toBe( 'none' );
	} );

	it( 'calls navigator.share with correct parameters when button is clicked', async () => {
		document.body.innerHTML = `
			<button class="js-web-share-api" data-title="Test Title" data-text="Test Text" data-url="https://example.com">Share</button>
		`;

		const shareMock = vi.fn().mockResolvedValue( undefined );
		( navigator as any ).share = shareMock;

		new WebShareApi( { selector: '.js-web-share-api' } );

		const button = document.querySelector(
			'.js-web-share-api'
		) as HTMLButtonElement;
		button.click();

		await Promise.resolve();

		expect( shareMock ).toHaveBeenCalledTimes( 1 );
		expect( shareMock ).toHaveBeenCalledWith( {
			title: 'Test Title',
			text: 'Test Text',
			url: 'https://example.com',
		} );
	} );
} );
