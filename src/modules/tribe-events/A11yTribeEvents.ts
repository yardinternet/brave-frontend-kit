const SELECTORS = {
	wrapper: '.tribe-events-c-top-bar__datepicker',
	view: '[data-js="tribe-events-view"]',
	container: '[data-js="tribe-events-top-bar-datepicker-container"]',
	openButton: '[data-js="tribe-events-top-bar-datepicker-button"]',
	picker: '.datepicker',
	daySelected: 'button.day[aria-selected]',
} as const;

const LABELS = {
	prev: 'Vorige maand',
	next: 'Volgende maand',
	switch: 'Selecteer maand',
} as const;

const OPEN_BUTTON_OPEN_CLASS =
	'tribe-events-c-top-bar__datepicker-button--open';
const TRIBE_DATEPICKER_INIT_EVENT = 'afterDatepickerInit.tribeEvents';
const PREV_LABEL_ATTRIBUTE = 'data-datepicker-prev-label';
const NEXT_LABEL_ATTRIBUTE = 'data-datepicker-next-label';
const SWITCH_LABEL_ATTRIBUTE = 'data-datepicker-switch-label';

/** Localizes & fixes the a11y of The Events Calendar's top-bar datepicker. */
export class A11yTribeEvents {
	private readonly initializedWrappers = new WeakSet< HTMLElement >();
	private readonly patchingWrappers = new WeakSet< HTMLElement >();
	private readonly rafByWrapper = new WeakMap< HTMLElement, number >();
	private readonly observersByWrapper = new Map<
		HTMLElement,
		MutationObserver[]
	>();
	private initFrame: number | null = null;

	constructor() {
		if ( ! document.querySelector( SELECTORS.view ) ) {
			return;
		}

		this.init();
		this.bindGlobalEvents();
		this.observeViewReplacement();
	}

	private applyEnhancements(
		wrapper: HTMLElement,
		picker: HTMLElement | null
	): void {
		this.syncOpenButtonExpanded( wrapper );

		if ( ! picker ) return;

		this.labelPrevButton( wrapper, picker );
		this.labelNextButton( wrapper, picker );
		this.labelSwitchButton( wrapper, picker );
		this.stripInvalidDayAria( picker );
	}

	// Trigger wiring

	private init(): void {
		this.disconnectDetachedObservers();

		document
			.querySelectorAll< HTMLElement >( SELECTORS.wrapper )
			.forEach( ( wrapper ) => this.initWrapper( wrapper ) );
	}

	private bindGlobalEvents(): void {
		if ( ! window.jQuery ) return;

		window
			.jQuery( document )
			.on( TRIBE_DATEPICKER_INIT_EVENT, () => this.init() );
	}

	/**
	 * The plugin replaces the view node on every AJAX navigation, and its
	 * `afterDatepickerInit` event is a one-shot we can race and miss. The view's
	 * parent survives, so watch it and re-init whenever a fresh view is inserted.
	 */
	private observeViewReplacement(): void {
		const view = document.querySelector< HTMLElement >( SELECTORS.view );
		const host = view ? view.parentElement : document.body;
		if ( ! host ) return;

		new MutationObserver( () => this.scheduleInit() ).observe( host, {
			childList: true,
		} );
	}

	private initWrapper( wrapper: HTMLElement ): void {
		if ( this.initializedWrappers.has( wrapper ) ) return;

		const container = wrapper.querySelector< HTMLElement >(
			SELECTORS.container
		);
		if ( ! container ) return;

		this.initializedWrappers.add( wrapper );
		this.syncOpenButtonExpanded( wrapper );

		this.observeContainer( wrapper, container );
		this.observeOpenButton( wrapper, container );
		this.bindOpenButton( wrapper, container );

		this.schedulePatch( wrapper, container );
	}

	private observeContainer(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		const observer = new MutationObserver( () =>
			this.schedulePatch( wrapper, container )
		);

		observer.observe( container, { childList: true, subtree: true } );
		this.trackObserver( wrapper, observer );
	}

	/**
	 * The plugin toggles open/closed state via the button's class (including
	 * outside-click close), so watch `class` to keep `aria-expanded` in sync.
	 * Filtering to `class` avoids reacting to our own attribute writes.
	 */
	private observeOpenButton(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		const openButton = wrapper.querySelector< HTMLElement >(
			SELECTORS.openButton
		);
		if ( ! openButton ) return;

		const observer = new MutationObserver( () =>
			this.schedulePatch( wrapper, container )
		);

		observer.observe( openButton, {
			attributes: true,
			attributeFilter: [ 'class' ],
		} );
		this.trackObserver( wrapper, observer );
	}

	private bindOpenButton(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		const openButton = wrapper.querySelector< HTMLElement >(
			SELECTORS.openButton
		);
		if ( ! openButton ) return;

		openButton.addEventListener( 'click', () =>
			this.schedulePatch( wrapper, container )
		);
	}

	/**
	 * Scheduling (rAF debounce)
	 */
	private scheduleInit(): void {
		if ( this.initFrame !== null ) {
			cancelAnimationFrame( this.initFrame );
		}

		this.initFrame = requestAnimationFrame( () => {
			this.initFrame = null;
			this.init();
		} );
	}

	private schedulePatch(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		if ( ! wrapper || ! container ) return;

		const pendingFrame = this.rafByWrapper.get( wrapper );
		if ( pendingFrame !== undefined ) {
			cancelAnimationFrame( pendingFrame );
		}

		const frame = requestAnimationFrame( () => {
			this.patchContainer( wrapper, container );
			this.rafByWrapper.delete( wrapper );
		} );

		this.rafByWrapper.set( wrapper, frame );
	}

	private patchContainer(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		if ( ! wrapper || ! container ) return;
		if ( this.patchingWrappers.has( wrapper ) ) return;

		this.patchingWrappers.add( wrapper );

		try {
			const picker = container.querySelector< HTMLElement >(
				SELECTORS.picker
			);
			this.applyEnhancements( wrapper, picker );
		} finally {
			this.patchingWrappers.delete( wrapper );
		}
	}

	/**
	 * Observer bookkeeping
	 */
	private trackObserver(
		wrapper: HTMLElement,
		observer: MutationObserver
	): void {
		const observers = this.observersByWrapper.get( wrapper );

		if ( observers ) {
			observers.push( observer );
		} else {
			this.observersByWrapper.set( wrapper, [ observer ] );
		}
	}

	private disconnectDetachedObservers(): void {
		this.observersByWrapper.forEach( ( observers, wrapper ) => {
			if ( wrapper.isConnected ) return;

			observers.forEach( ( observer ) => observer.disconnect() );
			this.observersByWrapper.delete( wrapper );
		} );
	}

	/**
	 *  Mirror the open-state modifier class onto `aria-expanded`.
	 */
	private syncOpenButtonExpanded( wrapper: HTMLElement ): void {
		const openButton = wrapper.querySelector< HTMLElement >(
			SELECTORS.openButton
		);
		if ( ! openButton ) return;

		const isOpen = openButton.classList.contains( OPEN_BUTTON_OPEN_CLASS );

		this.setAttributeIfChanged(
			openButton,
			'aria-expanded',
			isOpen ? 'true' : 'false'
		);
	}

	private labelPrevButton( wrapper: HTMLElement, picker: HTMLElement ): void {
		this.setButtonLabel(
			picker.querySelector< HTMLElement >( 'button.prev' ),
			this.getLabel( wrapper, PREV_LABEL_ATTRIBUTE, LABELS.prev )
		);
	}

	private labelNextButton( wrapper: HTMLElement, picker: HTMLElement ): void {
		this.setButtonLabel(
			picker.querySelector< HTMLElement >( 'button.next' ),
			this.getLabel( wrapper, NEXT_LABEL_ATTRIBUTE, LABELS.next )
		);
	}

	private labelSwitchButton(
		wrapper: HTMLElement,
		picker: HTMLElement
	): void {
		const label = this.getLabel(
			wrapper,
			SWITCH_LABEL_ATTRIBUTE,
			LABELS.switch
		);

		picker
			.querySelectorAll< HTMLElement >( 'button.datepicker-switch' )
			.forEach( ( button ) =>
				this.setAttributeIfChanged( button, 'aria-label', label )
			);
	}

	/**
	 * Day cells: `aria-selected` isn't valid on the button role; strip it.
	 */
	private stripInvalidDayAria( picker: HTMLElement ): void {
		picker
			.querySelectorAll< HTMLElement >( SELECTORS.daySelected )
			.forEach( ( button ) => button.removeAttribute( 'aria-selected' ) );
	}

	// DOM write helpers

	private setButtonLabel( button: HTMLElement | null, label: string ): void {
		if ( ! button ) return;

		this.setAttributeIfChanged( button, 'aria-label', label );
		this.setTextIfChanged(
			button.querySelector< HTMLElement >(
				'.tribe-common-a11y-visual-hide'
			),
			label
		);
	}

	private getLabel(
		wrapper: HTMLElement,
		attribute: string,
		fallback: string
	): string {
		return wrapper.getAttribute( attribute ) || fallback;
	}

	private setAttributeIfChanged(
		element: HTMLElement | null,
		attributeName: string,
		value: string
	): void {
		if ( ! element ) return;

		if ( element.getAttribute( attributeName ) !== value ) {
			element.setAttribute( attributeName, value );
		}
	}

	private setTextIfChanged(
		element: HTMLElement | null,
		value: string
	): void {
		if ( ! element ) return;

		if ( element.textContent !== value ) {
			element.textContent = value;
		}
	}
}
