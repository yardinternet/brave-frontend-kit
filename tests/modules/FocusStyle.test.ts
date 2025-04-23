import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FocusStyle } from '@modules/FocusStyle';

describe( 'FocusStyle', () => {
	let addEventListenerSpy: ReturnType< typeof vi.spyOn >;

	beforeEach( () => {
		// Clear body classes before each test
		document.body.className = '';

		// Reset any spies before each test
		addEventListenerSpy = vi.spyOn( document, 'addEventListener' );
	} );

	it( 'should use default class if no options are passed', () => {
		new FocusStyle();

		const event = new KeyboardEvent( 'keydown', { key: 'Tab' } );
		document.dispatchEvent( event );

		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			true
		);
	} );

	it( 'should apply custom bodyClass when specified', () => {
		new FocusStyle( { bodyClass: 'custom-focus' } );

		const event = new KeyboardEvent( 'keydown', { key: 'Tab' } );
		document.dispatchEvent( event );

		expect( document.body.classList.contains( 'custom-focus' ) ).toBe(
			true
		);
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			false
		);
	} );

	it( 'should not add class for non-Tab keys', () => {
		new FocusStyle();

		const event = new KeyboardEvent( 'keydown', { key: 'Enter' } );
		document.dispatchEvent( event );

		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			false
		);
	} );

	it( 'should remove class on mousedown', () => {
		new FocusStyle();

		// First simulate Tab
		const tabEvent = new KeyboardEvent( 'keydown', { key: 'Tab' } );
		document.dispatchEvent( tabEvent );
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			true
		);

		// Then simulate mouse click
		const mouseEvent = new MouseEvent( 'mousedown' );
		document.dispatchEvent( mouseEvent );
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			false
		);
	} );

	it( 'should bind keydown and mousedown events on init', () => {
		new FocusStyle();
		expect( addEventListenerSpy ).toHaveBeenCalledWith(
			'keydown',
			expect.any( Function )
		);
		expect( addEventListenerSpy ).toHaveBeenCalledWith(
			'mousedown',
			expect.any( Function )
		);
	} );

	it( 'should toggle class when switching between keyboard and mouse inputs', () => {
		new FocusStyle();

		// Tab ➝ class added
		document.dispatchEvent(
			new KeyboardEvent( 'keydown', { key: 'Tab' } )
		);
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			true
		);

		// Mousedown ➝ class removed
		document.dispatchEvent( new MouseEvent( 'mousedown' ) );
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			false
		);

		// Tab again ➝ class added again
		document.dispatchEvent(
			new KeyboardEvent( 'keydown', { key: 'Tab' } )
		);
		expect( document.body.classList.contains( 'js-user-is-tabbing' ) ).toBe(
			true
		);
	} );
} );
