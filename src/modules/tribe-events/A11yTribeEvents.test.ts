import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { A11yTribeEvents } from '@modules/tribe-events/A11yTribeEvents';

const VISUALLY_HIDDEN = 'tribe-common-a11y-visual-hide';
const OPEN_CLASS = 'tribe-events-c-top-bar__datepicker-button--open';
const TOGGLE_SELECTOR = '[data-js="tribe-events-top-bar-datepicker-button"]';

interface FixtureOptions {
	open?: boolean;
	withPicker?: boolean;
	wrapperAttrs?: Record< string, string >;
}

function buildFixture( options: FixtureOptions = {} ): void {
	const { open = false, withPicker = true, wrapperAttrs = {} } = options;

	const attrs = Object.entries( wrapperAttrs )
		.map( ( [ key, value ] ) => `${ key }="${ value }"` )
		.join( ' ' );

	const picker = withPicker
		? `
			<div class="datepicker">
				<button class="prev"><span class="${ VISUALLY_HIDDEN }"></span></button>
				<button class="next"><span class="${ VISUALLY_HIDDEN }"></span></button>
				<button class="datepicker-switch"></button>
				<button class="day" aria-selected="true"></button>
				<button class="day" aria-selected="false"></button>
			</div>`
		: '';

	document.body.innerHTML = `
		<div data-js="tribe-events-view">
			<div class="tribe-events-c-top-bar__datepicker" ${ attrs }>
				<button
					data-js="tribe-events-top-bar-datepicker-button"
					class="${ open ? OPEN_CLASS : '' }"
				></button>
				<div data-js="tribe-events-top-bar-datepicker-container">
					${ picker }
				</div>
			</div>
		</div>`;
}

function getEl( selector: string ): HTMLElement {
	const el = document.querySelector< HTMLElement >( selector );
	if ( ! el ) throw new Error( `Missing fixture element: ${ selector }` );
	return el;
}

describe( 'A11yTribeEvents', () => {
	beforeEach( () => {
		// Run rAF synchronously so patches apply during construction.
		vi.stubGlobal(
			'requestAnimationFrame',
			( cb: FrameRequestCallback ): number => {
				cb( 0 );
				return 0;
			}
		);
		vi.stubGlobal( 'cancelAnimationFrame', (): void => {} );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		document.body.innerHTML = '';
	} );

	it( 'applies Dutch fallback labels to prev/next/switch buttons', () => {
		buildFixture();

		new A11yTribeEvents();

		const prev = getEl( 'button.prev' );
		expect( prev.getAttribute( 'aria-label' ) ).toBe( 'Vorige maand' );
		expect(
			prev.querySelector( `.${ VISUALLY_HIDDEN }` )?.textContent
		).toBe( 'Vorige maand' );
		expect( getEl( 'button.next' ).getAttribute( 'aria-label' ) ).toBe(
			'Volgende maand'
		);
		expect(
			getEl( 'button.datepicker-switch' ).getAttribute( 'aria-label' )
		).toBe( 'Selecteer maand' );
	} );

	it( 'prefers wrapper data-attribute labels over the fallback', () => {
		buildFixture( {
			wrapperAttrs: {
				'data-datepicker-prev-label': 'Previous month',
				'data-datepicker-next-label': 'Next month',
				'data-datepicker-switch-label': 'Pick a month',
			},
		} );

		new A11yTribeEvents();

		expect( getEl( 'button.prev' ).getAttribute( 'aria-label' ) ).toBe(
			'Previous month'
		);
		expect( getEl( 'button.next' ).getAttribute( 'aria-label' ) ).toBe(
			'Next month'
		);
		expect(
			getEl( 'button.datepicker-switch' ).getAttribute( 'aria-label' )
		).toBe( 'Pick a month' );
	} );

	it( 'sets aria-expanded="true" when the toggle button is open', () => {
		buildFixture( { open: true } );

		new A11yTribeEvents();

		expect( getEl( TOGGLE_SELECTOR ).getAttribute( 'aria-expanded' ) ).toBe(
			'true'
		);
	} );

	it( 'sets aria-expanded="false" when the toggle button is closed', () => {
		buildFixture( { open: false } );

		new A11yTribeEvents();

		expect( getEl( TOGGLE_SELECTOR ).getAttribute( 'aria-expanded' ) ).toBe(
			'false'
		);
	} );

	it( 'strips invalid aria-selected from day cells', () => {
		buildFixture();

		new A11yTribeEvents();

		const days = document.querySelectorAll( 'button.day' );
		expect( days.length ).toBe( 2 );
		days.forEach( ( day ) =>
			expect( day.hasAttribute( 'aria-selected' ) ).toBe( false )
		);
	} );

	it( 'does not throw and still syncs aria-expanded without a .datepicker', () => {
		buildFixture( { withPicker: false, open: true } );

		expect( () => new A11yTribeEvents() ).not.toThrow();
		expect( getEl( TOGGLE_SELECTOR ).getAttribute( 'aria-expanded' ) ).toBe(
			'true'
		);
	} );

	it( 'registers no observers when no Tribe view is present', () => {
		document.body.innerHTML = '';
		const observeSpy = vi.spyOn( MutationObserver.prototype, 'observe' );

		new A11yTribeEvents();

		expect( observeSpy ).not.toHaveBeenCalled();
	} );
} );
