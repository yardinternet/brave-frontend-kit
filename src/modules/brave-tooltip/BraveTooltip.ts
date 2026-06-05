/**
 * External dependencies
 */
import {
	arrow,
	computePosition,
	flip,
	offset,
	shift,
	type Placement,
} from '@floating-ui/dom';

interface BraveTooltipOptions {
	selectorArrow?: string;
	hideDelay?: number;
	placement?: Placement;
	tooltipId?: string;
	hiddenClass?: string;
}

export class BraveTooltip {
	private readonly trigger: HTMLElement;
	private readonly tooltip: HTMLElement | null;
	private readonly tooltipArrow: HTMLElement | null;
	private readonly selectorArrow: string;
	private readonly hideDelay: number;
	private readonly placement: Placement;
	private readonly hiddenClass: string;
	private hoverTimeout: ReturnType< typeof setTimeout > | null = null;

	constructor( trigger: HTMLElement, options: BraveTooltipOptions = {} ) {
		this.trigger = trigger;
		this.selectorArrow = options.selectorArrow ?? '.js-brave-tooltip-arrow';
		this.hideDelay = options.hideDelay ?? 150;
		this.hiddenClass = options.hiddenClass ?? 'hidden';
		this.placement = options.placement ?? 'top';
		this.tooltip = null;
		this.tooltipArrow = null;

		const tooltipId = this.resolveTooltipId( options.tooltipId );
		if ( ! tooltipId ) return;

		const tooltip = document.getElementById( tooltipId );
		const tooltipArrow =
			tooltip?.querySelector< HTMLElement >( this.selectorArrow ) || null;

		this.tooltip = tooltip;
		this.tooltipArrow = tooltipArrow;

		this.init();
	}

	private resolveTooltipId( tooltipId?: string ): string | null {
		if ( tooltipId?.trim() ) {
			return tooltipId.trim();
		}

		const describedBy = this.trigger.getAttribute( 'aria-describedby' );
		if ( ! describedBy ) return null;

		const ids = describedBy
			.split( /\s+/ )
			.map( ( id ) => id.trim() )
			.filter( Boolean );

		for ( const id of ids ) {
			if ( document.getElementById( id ) ) {
				return id;
			}
		}

		return null;
	}

	private init(): void {
		if ( ! this.tooltip || ! this.tooltipArrow ) return;

		this.tooltip.classList.add( this.hiddenClass );
		this.tooltip.setAttribute( 'aria-hidden', 'true' );

		this.trigger.addEventListener( 'mouseenter', this.open );
		this.trigger.addEventListener( 'mouseleave', this.scheduleClose );
		this.trigger.addEventListener( 'focus', this.open );
		this.trigger.addEventListener( 'blur', this.scheduleClose );

		this.tooltip.addEventListener( 'mouseenter', this.open );
		this.tooltip.addEventListener( 'mouseleave', this.scheduleClose );
	}

	private clearHoverTimeout(): void {
		if ( ! this.hoverTimeout ) return;

		clearTimeout( this.hoverTimeout );
		this.hoverTimeout = null;
	}

	private scheduleClose = (): void => {
		this.clearHoverTimeout();
		this.hoverTimeout = setTimeout( () => {
			this.close();
		}, this.hideDelay );
	};

	isActive(): boolean {
		if ( ! this.tooltip ) return false;

		return ! this.tooltip.classList.contains( this.hiddenClass );
	}

	open = (): void => {
		if ( ! this.tooltip || ! this.tooltipArrow ) return;

		this.clearHoverTimeout();
		this.tooltip.classList.remove( this.hiddenClass );
		this.tooltip.setAttribute( 'aria-hidden', 'false' );

		this.updateTooltipPosition();
	};

	close(): void {
		if ( ! this.tooltip ) return;

		this.clearHoverTimeout();
		this.tooltip.classList.add( this.hiddenClass );
		this.tooltip.setAttribute( 'aria-hidden', 'true' );
	}

	toggle(): void {
		this.isActive() ? this.close() : this.open();
	}

	private updateTooltipPosition(): void {
		if ( ! this.tooltip || ! this.tooltipArrow ) return;

		computePosition( this.trigger, this.tooltip, {
			placement: this.placement,
			middleware: [
				offset( 8 ),
				flip(),
				shift( { padding: 2 } ),
				arrow( { element: this.tooltipArrow } ),
			],
		} )
			.then( ( { x, y, placement, middlewareData } ) => {
				Object.assign( this.tooltip!.style, {
					top: `${ y }px`,
					left: `${ x }px`,
				} );

				const arrowData = middlewareData.arrow;
				if ( ! arrowData ) return;

				const staticSideMap: Record< string, string > = {
					top: 'bottom',
					right: 'left',
					bottom: 'top',
					left: 'right',
				};

				const basePlacement = placement.split( '-' )[ 0 ] as Placement;
				const staticSide = staticSideMap[ basePlacement ];

				Object.assign( this.tooltipArrow!.style, {
					left: arrowData.x !== null ? `${ arrowData.x }px` : '',
					top: arrowData.y !== null ? `${ arrowData.y }px` : '',
					right: '',
					bottom: '',
					[ staticSide ]: '-4px',
				} );
			} )
			.catch( () => {
				// Ignore positioning failures (for example, if elements are detached)
				// so they do not surface as unhandled promise rejections.
			} );
	}
}
