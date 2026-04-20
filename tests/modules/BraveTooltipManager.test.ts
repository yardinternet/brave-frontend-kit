import { beforeEach, describe, expect, it } from 'vitest';

import { BraveTooltipManager } from '@modules/BraveTooltipManager';

const tooltipHtml = /*html*/ `
	<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-1'>
		Trigger 1
	</button>
	<div id='tooltip-1' class='hidden' aria-hidden='true'>
		<div class='js-brave-tooltip-arrow'></div>
		Tooltip 1
	</div>

	<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-2'>
		Trigger 2
	</button>
	<div id='tooltip-2' class='hidden' aria-hidden='true'>
		<div class='js-brave-tooltip-arrow'></div>
		Tooltip 2
	</div>
`;

const mixedTooltipHtml = /*html*/ `
	<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-1'>
		Trigger 1
	</button>
	<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-missing'>
		Trigger missing target
	</button>
	<button
		class='js-brave-tooltip-trigger'
		aria-describedby='tooltip-missing tooltip-2'
	>
		Trigger with multiple ids
	</button>
	<button class='js-brave-tooltip-trigger'>Trigger missing target</button>
	<div id='tooltip-1' class='hidden' aria-hidden='true'>
		<div class='js-brave-tooltip-arrow'></div>
		Tooltip 1
	</div>
	<div id='tooltip-2' class='hidden' aria-hidden='true'>
		<div class='js-brave-tooltip-arrow'></div>
		Tooltip 2
	</div>
`;

function getTooltip( id: string ): HTMLElement {
	return document.getElementById( id ) as HTMLElement;
}

describe( 'BraveTooltipManager', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'does not throw when there are no tooltip triggers in the DOM', () => {
		expect( () => new BraveTooltipManager() ).not.toThrow();
	} );

	it( 'creates tooltips only for aria-describedby ids that exist in the DOM', () => {
		document.body.innerHTML = mixedTooltipHtml;
		const manager = new BraveTooltipManager();

		expect( manager.has( 'tooltip-1' ) ).toBe( true );
		expect( manager.has( 'tooltip-2' ) ).toBe( true );
		expect( manager.has( 'tooltip-missing' ) ).toBe( false );
		expect( manager.get( 'tooltip-1' ) ).toBeDefined();
		expect( manager.get( 'tooltip-2' ) ).toBeDefined();
	} );

	it( 'opens, closes, and toggles tooltip visibility by id', () => {
		document.body.innerHTML = tooltipHtml;
		const manager = new BraveTooltipManager();
		const tooltip = getTooltip( 'tooltip-1' );

		manager.open( 'tooltip-1' );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'false' );

		manager.close( 'tooltip-1' );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'true' );

		manager.toggle( 'tooltip-1' );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
	} );

	it( 'closes all tooltips through the manager API', () => {
		document.body.innerHTML = tooltipHtml;
		const manager = new BraveTooltipManager();
		const tooltipOne = getTooltip( 'tooltip-1' );
		const tooltipTwo = getTooltip( 'tooltip-2' );

		manager.open( 'tooltip-1' );
		manager.open( 'tooltip-2' );

		expect( tooltipOne.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltipTwo.classList.contains( 'hidden' ) ).toBe( false );

		manager.closeAll();

		expect( tooltipOne.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltipTwo.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltipOne.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect( tooltipTwo.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
	} );

	it( 'closes all tooltips when Escape is pressed', () => {
		document.body.innerHTML = tooltipHtml;
		const manager = new BraveTooltipManager();
		const tooltipOne = getTooltip( 'tooltip-1' );
		const tooltipTwo = getTooltip( 'tooltip-2' );

		manager.open( 'tooltip-1' );
		manager.open( 'tooltip-2' );

		document.dispatchEvent(
			new KeyboardEvent( 'keyup', { key: 'Escape', bubbles: true } )
		);

		expect( tooltipOne.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltipTwo.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltipOne.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect( tooltipTwo.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
	} );
} );
