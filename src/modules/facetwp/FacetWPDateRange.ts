interface FacetWPDateRangeOptions {
	mobileBreakpoint?: number;
}

const SELECTORS = {
	dateFacet: '.facetwp-type-date_range',
	dateMin: '.facetwp-date-min[type="text"]',
	dateMax: '.facetwp-date-max[type="text"]',
	datePicker: '.fdate-wrap',
} as const;

const CLASSES = {
	minFocused: 'facetwp-date-min-is-focused',
	maxFocused: 'facetwp-date-max-is-focused',
} as const;

export class FacetWPDateRange {
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

		const facet = target.closest< HTMLElement >( SELECTORS.dateFacet );

		if ( ! facet ) return;

		this.moveDatePicker( facet );
		this.setDatePickerState( target );
	};

	private isDateInput( element: EventTarget | null ): element is HTMLElement {
		if ( ! element || ! ( element instanceof HTMLElement ) ) {
			return false;
		}

		return (
			element.matches( SELECTORS.dateMin ) ||
			element.matches( SELECTORS.dateMax )
		);
	}

	private syncDatePickerToFocusedInput = (): void => {
		const focusedElement =
			document.documentElement.ownerDocument.activeElement;

		if ( ! this.isDateInput( focusedElement ) ) return;

		const facet = focusedElement.closest< HTMLElement >(
			SELECTORS.dateFacet
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
		const fdate = document.querySelector< HTMLElement >(
			SELECTORS.datePicker
		);

		if ( ! fdate ) return;

		if ( window.innerWidth > this.MOBILE_BREAKPOINT ) {
			document.body.appendChild( fdate );
			return;
		}

		facet.appendChild( fdate );
	}

	private setDatePickerState( input: HTMLElement ): void {
		const fdate = document.querySelector< HTMLElement >(
			SELECTORS.datePicker
		);

		if ( ! fdate ) return;

		fdate.classList.toggle(
			CLASSES.minFocused,
			input.matches( SELECTORS.dateMin )
		);
		fdate.classList.toggle(
			CLASSES.maxFocused,
			input.matches( SELECTORS.dateMax )
		);
	}
}
