/**
 * When a facetwp date range facet is used inside a <dialog> element, we need to change the place of the datepicker.
 * By default, the datepicker is placed at the end of the body element and that's not working when the date range facet is inside a <dialog> element.
 */

interface FacetWPDateRangeOptions {
	mobileBreakpoint?: number;
}

export class FacetWPDateRange {
	private readonly DATE_FACET_SELECTOR = '.facetwp-type-date_range';
	private readonly DATE_MIN_SELECTOR = '.facetwp-date-min[type="text"]';
	private readonly DATE_MAX_SELECTOR = '.facetwp-date-max[type="text"]';
	private readonly MOBILE_BREAKPOINT;
	private resizeRafId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;

	constructor( options: FacetWPDateRangeOptions = {} ) {
		this.MOBILE_BREAKPOINT = options.mobileBreakpoint ?? 960;

		this.init();
	}

	private init(): void {
		this.bindEvents();
	}

	private bindEvents(): void {
		document.addEventListener( 'focusin', this.handleDateInputFocus );
		document.addEventListener(
			'facetwp-loaded',
			this.syncDatePickerToFocusedInput
		);

		const canUseResizeObserver = 'ResizeObserver' in globalThis;

		if ( canUseResizeObserver ) {
			this.resizeObserver = new ResizeObserver( () =>
				this.handleViewportResize()
			);
			this.resizeObserver.observe( document.documentElement );
			return;
		}

		window.addEventListener( 'resize', this.handleViewportResize );
	}

	public destroy(): void {
		document.removeEventListener( 'focusin', this.handleDateInputFocus );
		document.removeEventListener(
			'facetwp-loaded',
			this.syncDatePickerToFocusedInput
		);
		window.removeEventListener( 'resize', this.handleViewportResize );

		if ( this.resizeObserver ) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if ( null !== this.resizeRafId ) {
			cancelAnimationFrame( this.resizeRafId );
			this.resizeRafId = null;
		}
	}

	private handleDateInputFocus = ( event: FocusEvent ): void => {
		const target = event.target;

		if ( ! this.isDateInput( target ) ) return;

		const facet = target.closest< HTMLElement >( this.DATE_FACET_SELECTOR );

		if ( ! facet ) return;

		this.moveDatePicker( facet );
		this.setDatePickerState( target );
	};

	private isDateInput( element: EventTarget | null ): element is HTMLElement {
		if ( ! element || ! ( element instanceof HTMLElement ) ) {
			return false;
		}

		return (
			element.matches( this.DATE_MIN_SELECTOR ) ||
			element.matches( this.DATE_MAX_SELECTOR )
		);
	}

	private syncDatePickerToFocusedInput = (): void => {
		const focusedElement =
			document.documentElement.ownerDocument.activeElement;

		if ( ! this.isDateInput( focusedElement ) ) return;

		const facet = focusedElement.closest< HTMLElement >(
			this.DATE_FACET_SELECTOR
		);

		if ( ! facet ) return;

		this.moveDatePicker( facet );
		this.setDatePickerState( focusedElement );
	};

	private handleViewportResize = (): void => {
		if ( null !== this.resizeRafId ) {
			cancelAnimationFrame( this.resizeRafId );
		}

		this.resizeRafId = requestAnimationFrame( () => {
			this.resizeRafId = null;
			this.syncDatePickerToFocusedInput();
		} );
	};

	private moveDatePicker( facet: HTMLElement ): void {
		const fdate = document.querySelector< HTMLElement >( '.fdate-wrap' );

		if ( ! fdate ) return;

		if ( window.innerWidth > this.MOBILE_BREAKPOINT ) {
			document.body.appendChild( fdate );
			return;
		}

		facet.appendChild( fdate );
	}

	private setDatePickerState( input: HTMLElement ): void {
		const fdate = document.querySelector< HTMLElement >( '.fdate-wrap' );

		if ( ! fdate ) return;

		fdate.classList.toggle(
			'facetwp-date-min-is-focused',
			input.matches( this.DATE_MIN_SELECTOR )
		);
		fdate.classList.toggle(
			'facetwp-date-max-is-focused',
			input.matches( this.DATE_MAX_SELECTOR )
		);
	}
}
