/**
 * External dependencies
 */
import { type Placement } from '@floating-ui/dom';

/**
 * Internal dependencies
 */
import { BraveTooltip } from './BraveTooltip';

interface BraveTooltipManagerOptions {
	selectorTrigger?: string;
	selectorArrow?: string;
	hideDelay?: number;
	placement?: Placement;
	hiddenClass?: string;
}

export class BraveTooltipManager {
	private readonly selectorTrigger: string;
	private readonly options: Omit<
		BraveTooltipManagerOptions,
		'selectorTrigger'
	>;
	private readonly tooltips = new Map< string, BraveTooltip >();

	constructor( options: BraveTooltipManagerOptions = {} ) {
		this.selectorTrigger =
			options.selectorTrigger || '.js-brave-tooltip-trigger';

		this.options = {
			selectorArrow: options.selectorArrow,
			hideDelay: options.hideDelay,
			placement: options.placement,
			hiddenClass: options.hiddenClass,
		};

		const triggers = document.querySelectorAll< HTMLElement >(
			this.selectorTrigger
		);

		triggers.forEach( ( trigger ) => {
			const tooltipIds = this.getTooltipIds( trigger );
			if ( ! tooltipIds.length ) return;

			tooltipIds.forEach( ( tooltipId ) => {
				this.tooltips.set(
					tooltipId,
					new BraveTooltip( trigger, {
						...this.options,
						tooltipId,
					} )
				);
			} );
		} );

		if ( this.tooltips.size ) {
			document.addEventListener( 'keyup', this.onKeyUp );
		}
	}

	private onKeyUp = ( event: KeyboardEvent ): void => {
		if ( event.key !== 'Escape' ) return;

		this.closeAll();
	};

	private getTooltipIds( trigger: HTMLElement ): string[] {
		const describedBy = trigger.getAttribute( 'aria-describedby' );
		if ( ! describedBy ) return [];

		const ids = describedBy
			.split( /\s+/ )
			.map( ( id ) => id.trim() )
			.filter( Boolean );

		const uniqueIds = [ ...new Set( ids ) ];

		return uniqueIds.filter( ( id ) => !! document.getElementById( id ) );
	}

	has( id: string ): boolean {
		return this.tooltips.has( id );
	}

	get( id: string ): BraveTooltip | undefined {
		return this.tooltips.get( id );
	}

	open( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.open();
		}
	}

	close( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.close();
		}
	}

	toggle( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.toggle();
		}
	}

	closeAll(): void {
		this.tooltips.forEach( ( tooltip ) => tooltip.close() );
	}
}
