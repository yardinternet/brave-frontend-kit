import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BraveTooltip } from '@modules/BraveTooltip';

const { computePositionMock } = vi.hoisted( () => {
	return {
		computePositionMock: vi.fn(),
	};
} );

vi.mock( '@floating-ui/dom', () => {
	return {
		computePosition: computePositionMock,
		flip: vi.fn( () => ( { name: 'flip' } ) ),
		shift: vi.fn( () => ( { name: 'shift' } ) ),
		offset: vi.fn( () => ( { name: 'offset' } ) ),
		arrow: vi.fn( () => ( { name: 'arrow' } ) ),
	};
} );

const tooltipHtml = /*html*/ `
	<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-1'>
		Trigger 1
	</button>
	<div id='tooltip-1' class='hidden' aria-hidden='true'>
		<div class='js-brave-tooltip-arrow'></div>
		Tooltip 1
	</div>
`;

function setup(): {
	trigger: HTMLElement;
	tooltip: HTMLElement;
	tooltipArrow: HTMLElement;
	instance: BraveTooltip;
} {
	document.body.innerHTML = tooltipHtml;

	const trigger = document.querySelector(
		'.js-brave-tooltip-trigger'
	) as HTMLElement;
	const tooltip = document.getElementById( 'tooltip-1' ) as HTMLElement;
	const tooltipArrow = tooltip.querySelector(
		'.js-brave-tooltip-arrow'
	) as HTMLElement;

	const instance = new BraveTooltip( trigger );

	return { trigger, tooltip, tooltipArrow, instance };
}

describe( 'BraveTooltip', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
		vi.clearAllMocks();
		vi.useRealTimers();

		computePositionMock.mockResolvedValue( {
			x: 10,
			y: 20,
			placement: 'top',
			middlewareData: {
				arrow: {
					x: 3,
					y: 4,
				},
			},
		} );
	} );

	it( 'does not throw when trigger has no aria-describedby', () => {
		document.body.innerHTML =
			"<button class='js-brave-tooltip-trigger'>Trigger</button>";

		const trigger = document.querySelector(
			'.js-brave-tooltip-trigger'
		) as HTMLElement;
		const tooltip = new BraveTooltip( trigger );

		expect( () => tooltip.open() ).not.toThrow();
		expect( () => tooltip.close() ).not.toThrow();
		expect( tooltip.isActive() ).toBe( false );
	} );

	it( 'opens tooltip on focus and positions with Floating UI', async () => {
		const { trigger, tooltip } = setup();

		trigger.dispatchEvent( new FocusEvent( 'focus', { bubbles: true } ) );
		await Promise.resolve();

		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
		expect( computePositionMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'closes tooltip after hideDelay on mouseleave', () => {
		vi.useFakeTimers();
		const { trigger, tooltip } = setup();

		trigger.dispatchEvent( new FocusEvent( 'focus', { bubbles: true } ) );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );

		trigger.dispatchEvent(
			new MouseEvent( 'mouseleave', { bubbles: true } )
		);
		vi.advanceTimersByTime( 149 );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );

		vi.advanceTimersByTime( 1 );
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( true );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
	} );

	it( 'cancels scheduled close when entering the tooltip', () => {
		vi.useFakeTimers();
		const { trigger, tooltip, instance } = setup();

		instance.open();
		trigger.dispatchEvent(
			new MouseEvent( 'mouseleave', { bubbles: true } )
		);

		tooltip.dispatchEvent(
			new MouseEvent( 'mouseenter', { bubbles: true } )
		);
		vi.advanceTimersByTime( 200 );

		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
	} );

	it( 'toggles tooltip state through API', () => {
		const { tooltip, instance } = setup();

		instance.toggle();
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );

		instance.toggle();
		expect( tooltip.classList.contains( 'hidden' ) ).toBe( true );
	} );

	it( 'fails safely when Floating UI computePosition rejects', async () => {
		const { trigger, tooltip } = setup();
		computePositionMock.mockRejectedValueOnce(
			new Error( 'Tooltip element detached' )
		);

		expect( () => {
			trigger.dispatchEvent(
				new FocusEvent( 'focus', { bubbles: true } )
			);
		} ).not.toThrow();

		await Promise.resolve();

		expect( tooltip.classList.contains( 'hidden' ) ).toBe( false );
		expect( tooltip.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
	} );
} );
