import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Accordion } from '@modules/Accordion';

describe( 'Accordion', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	} );

	// Polyfill CSS.escape for jsdom/Vitest environment
	if (
		typeof globalThis.CSS === 'undefined' ||
		typeof globalThis.CSS.escape !== 'function'
	) {
		globalThis.CSS = {
			...( globalThis.CSS || {} ),
			escape: ( str: string ): string =>
				String( str ).replace(
					/[^a-zA-Z0-9\u00A0-\u10FFFF\-_]/g,
					( c ) => '\\' + c.charCodeAt( 0 ).toString( 16 ) + ' '
				),
		};
	}

	const singleAccordionHtml = /*html*/ `
		<div class='accordion-wrapper'>
			<div class='ac'>
				<button class='ac-trigger'>Header 1</button>
				<div class='ac-panel'>Panel 1</div>
			</div>
			<div class='ac is-open'>
				<button class='ac-trigger'>Header 2</button>
				<div class='ac-panel'>Panel 2</div>
			</div>
		</div>
	`;

	const multipleAccordionsHtml = /*html*/ `
		<div class='accordion-wrapper' id='acc1'>
			<div class='ac'>
				<button class='ac-trigger'>Header 1A</button>
				<div class='ac-panel'>Panel 1A</div>
			</div>
			<div class='ac is-open'>
				<button class='ac-trigger'>Header 1B</button>
				<div class='ac-panel'>Panel 1B</div>
			</div>
		</div>
		<div class='accordion-wrapper' id='acc2'>
			<div class='ac is-open'>
				<button class='ac-trigger'>Header 2A</button>
				<div class='ac-panel'>Panel 2A</div>
			</div>
			<div class='ac'>
				<button class='ac-trigger'>Header 2B</button>
				<div class='ac-panel'>Panel 2B</div>
			</div>
		</div>
	`;

	const multipleAllowedHtml = /*html*/ `
		<div class='accordion-wrapper' data-multiple='true'>
			<div class='ac'>
				<button class='ac-trigger'>Header 1</button>
				<div class='ac-panel'>Panel 1</div>
			</div>
			<div class='ac'>
				<button class='ac-trigger'>Header 2</button>
				<div class='ac-panel'>Panel 2</div>
			</div>
			<div class='ac'>
				<button class='ac-trigger'>Header 3</button>
				<div class='ac-panel'>Panel 3</div>
			</div>
		</div>
	`;

	function testSingleAccordionOpenPanel(): void {
		document.body.innerHTML = singleAccordionHtml;
		new Accordion();

		const accordionElem = document.querySelector(
			'.accordion-wrapper'
		) as HTMLElement;
		expect( accordionElem ).not.toBeNull();

		// Find the item that should be open
		const openItem = accordionElem.querySelector( '.ac.is-open' );
		expect( openItem ).not.toBeNull();

		// Find the panel inside the open item
		const openPanel = openItem?.querySelector( '.ac-panel' );
		expect( openPanel ).not.toBeNull();

		// Check that the open panel is actually visible
		const style = window.getComputedStyle( openPanel! );
		expect( style.display ).not.toBe( 'none' );
		expect( style.visibility ).toBe( 'visible' );
	}

	function testMultipleAccordionsOpenPanels(): void {
		document.body.innerHTML = multipleAccordionsHtml;
		new Accordion();

		const acc1 = document.getElementById( 'acc1' )!;
		const acc2 = document.getElementById( 'acc2' )!;

		// Check that the first accordion's open panel is visible
		const openPanel1 = acc1.querySelector(
			'.ac.is-open .ac-panel'
		) as HTMLElement;
		expect( openPanel1 ).not.toBeNull();
		const style1 = window.getComputedStyle( openPanel1! );
		expect( style1.display ).not.toBe( 'none' );
		expect( style1.visibility ).toBe( 'visible' );

		// Check that the second accordion's open panel is visible
		const openPanel2 = acc2.querySelector(
			'.ac.is-open .ac-panel'
		) as HTMLElement;
		expect( openPanel2 ).not.toBeNull();
		const style2 = window.getComputedStyle( openPanel2! );
		expect( style2.display ).not.toBe( 'none' );
		expect( style2.visibility ).toBe( 'visible' );
	}

	function testNoAccordionsPresent(): void {
		document.body.innerHTML = /*html*/ '';
		// Check that Accordion does not throw an error if nothing is present
		expect( () => new Accordion() ).not.toThrow();
	}

	async function testMultipleAllowed(): Promise< void > {
		// This test checks that when data-multiple is true, you can open multiple panels at once
		const expectedAnimationTime = 500;
		document.body.innerHTML = multipleAllowedHtml;
		new Accordion();
		const accordionElem = document.querySelector(
			'.accordion-wrapper'
		) as HTMLElement;
		expect( accordionElem.dataset.multiple ).toBe( 'true' );

		// Click the first trigger to open the first panel then wait for animation to finish
		const triggers = accordionElem.querySelectorAll( '.ac-trigger' );
		triggers[ 0 ].dispatchEvent(
			new window.MouseEvent( 'click', { bubbles: true } )
		);
		await new Promise( ( resolve ) =>
			setTimeout( resolve, expectedAnimationTime )
		);

		// Click the second trigger to open the second panel
		triggers[ 1 ].dispatchEvent(
			new window.MouseEvent( 'click', { bubbles: true } )
		);
		await new Promise( ( resolve ) =>
			setTimeout( resolve, expectedAnimationTime )
		);

		// Check that at least two panels are visible at the same time
		const panels = accordionElem.querySelectorAll( '.ac-panel' );
		const styles = Array.from( panels ).map( ( panel ) =>
			window.getComputedStyle( panel as Element )
		);
		const visiblePanels = styles.filter(
			( style ) =>
				style.display !== 'none' && style.visibility === 'visible'
		);
		expect( visiblePanels.length ).toBeGreaterThanOrEqual( 2 );
	}

	it(
		'shows the correct panel for is-open item on initialization',
		testSingleAccordionOpenPanel
	);
	it(
		'shows correct open panels for multiple accordions independently',
		testMultipleAccordionsOpenPanels
	);
	it(
		'does not throw if no accordions are present in the DOM',
		testNoAccordionsPresent
	);
	it(
		'respects data-multiple attribute for allowing multiple panels open',
		testMultipleAllowed
	);
} );
