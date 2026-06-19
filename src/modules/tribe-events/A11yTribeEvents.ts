/** Localizes & fixes the a11y of The Events Calendar's top-bar datepicker. */
export class A11yTribeEvents {
	private static readonly WRAPPER_SELECTOR =
		'.tribe-events-c-top-bar__datepicker';
	private static readonly VIEW_SELECTOR = '[data-js="tribe-events-view"]';
	private static readonly CONTAINER_SELECTOR =
		'[data-js="tribe-events-top-bar-datepicker-container"]';
	private static readonly OPEN_BUTTON_SELECTOR =
		'[data-js="tribe-events-top-bar-datepicker-button"]';
	private static readonly OPEN_BUTTON_OPEN_CLASS =
		'tribe-events-c-top-bar__datepicker-button--open';
	private static readonly TRIBE_DATEPICKER_INIT_EVENT =
		'afterDatepickerInit.tribeEvents';
	private static readonly DAY_BUTTON_WITH_ARIA_SELECTED_SELECTOR =
		'button.day[aria-selected]';
	private static readonly PREV_LABEL_ATTRIBUTE = 'data-datepicker-prev-label';
	private static readonly NEXT_LABEL_ATTRIBUTE = 'data-datepicker-next-label';
	private static readonly SWITCH_LABEL_ATTRIBUTE =
		'data-datepicker-switch-label';
	private static readonly FALLBACK_PREV_LABEL = 'Vorige maand';
	private static readonly FALLBACK_NEXT_LABEL = 'Volgende maand';
	private static readonly FALLBACK_SWITCH_LABEL = 'Selecteer maand';

	private readonly initializedWrappers = new WeakSet< HTMLElement >();
	private readonly patchingWrappers = new WeakSet< HTMLElement >();
	private readonly rafByWrapper = new WeakMap< HTMLElement, number >();
	private readonly observersByWrapper = new Map<
		HTMLElement,
		MutationObserver[]
	>();
	private initFrame: number | null = null;

	constructor() {
		if ( ! document.querySelector( A11yTribeEvents.VIEW_SELECTOR ) ) {
			return;
		}

		this.thingsThatTriggerApplyEnhancements();
	}

	// ============================================================================
	// ===================== Bootstrapping & re-render resilience ==================
	// ============================================================================
	private thingsThatTriggerApplyEnhancements(): void {
		// 1. Initial page load. Also wires triggers 4-6 for every wrapper found,
		//    via init() → initWrapper().
		this.init();

		// 2. jQuery `afterDatepickerInit.tribeEvents` (the plugin re-initialising
		//    its datepicker) → init().
		this.bindGlobalEvents();

		// 3. The view being replaced via AJAX navigation → scheduleInit() → init().
		this.observeViewReplacement();

		// Registered per wrapper in initWrapper() (they need a wrapper/container):
		// 4. Container subtree mutations → observeContainer()  → schedulePatch()
		// 5. Open-button class changes   → observeOpenButton() → schedulePatch()
		// 6. Open-button click           → bindOpenButton()    → schedulePatch()
	}

	/**
	 * The five accessibility enhancements applied to Tribe's events calendar
	 */
	private applyEnhancements(
		wrapper: HTMLElement,
		picker: HTMLElement | null
	): void {
		// 1. toggle button: aria-expanded reflects open/closed state
		this.syncOpenButtonExpanded( wrapper );

		if ( ! picker ) return;

		// 2. prev-month button label (NL)
		this.labelPrevButton( wrapper, picker );
		// 3. next-month button label (NL)
		this.labelNextButton( wrapper, picker );
		// 4. month-switch button label (NL)
		this.labelSwitchButton( wrapper, picker );
		// 5. day cells: strip invalid aria-selected
		this.stripInvalidDayAria( picker );
	}

	// ============================================================================
	// =============================== Trigger wiring ===============================
	// ============================================================================
	private init(): void {
		this.disconnectDetachedObservers();

		document
			.querySelectorAll< HTMLElement >( A11yTribeEvents.WRAPPER_SELECTOR )
			.forEach( ( wrapper ) => this.initWrapper( wrapper ) );
	}

	private bindGlobalEvents(): void {
		if ( ! window.jQuery ) return;

		window
			.jQuery( document )
			.on( A11yTribeEvents.TRIBE_DATEPICKER_INIT_EVENT, () => {
				this.init();
			} );
	}

	/**
	 * The Events Calendar re-renders its view (top bar and datepicker included)
	 * via AJAX, replacing the `[data-js="tribe-events-view"]` node on every
	 * navigation. Its `afterDatepickerInit` event is a one-shot we can race and
	 * miss on initial load, leaving the patcher attached to nothing. The view's
	 * parent survives those re-renders, so watch it and re-run init whenever the
	 * view (and its fresh datepicker) is inserted — independent of event timing.
	 */
	private observeViewReplacement(): void {
		const view = document.querySelector< HTMLElement >(
			A11yTribeEvents.VIEW_SELECTOR
		);
		const host = view ? view.parentElement : document.body;
		if ( ! host ) return;

		const observer = new MutationObserver( () => this.scheduleInit() );
		observer.observe( host, { childList: true } );
	}

	private initWrapper( wrapper: HTMLElement ): void {
		if ( ! wrapper || this.initializedWrappers.has( wrapper ) ) {
			return;
		}

		const container = wrapper.querySelector< HTMLElement >(
			A11yTribeEvents.CONTAINER_SELECTOR
		);

		if ( ! container ) return;

		this.initializedWrappers.add( wrapper );
		// Own the initial `aria-expanded` from JS (the template no longer sets
		// it): reflect the current open/closed state immediately on attach.
		this.syncOpenButtonExpanded( wrapper );

		// Per-wrapper triggers (4-6 in thingsThatTriggerApplyEnhancements):
		this.observeContainer( wrapper, container ); // 4
		this.observeOpenButton( wrapper, container ); // 5
		this.bindOpenButton( wrapper, container ); // 6

		this.schedulePatch( wrapper, container );
	}

	private observeContainer(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		const observer = new MutationObserver( () => {
			this.schedulePatch( wrapper, container );
		} );

		observer.observe( container, {
			childList: true,
			subtree: true,
		} );

		this.trackObserver( wrapper, observer );
	}

	private observeOpenButton(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		const openButton = wrapper.querySelector< HTMLElement >(
			A11yTribeEvents.OPEN_BUTTON_SELECTOR
		);

		if ( ! openButton ) return;

		// The plugin toggles the open/closed state through the button's class
		// (including when closing via an outside click), so watch that class to
		// keep `aria-expanded` in sync. We only set `aria-expanded` ourselves,
		// so filtering to `class` avoids reacting to our own writes.
		const observer = new MutationObserver( () => {
			this.schedulePatch( wrapper, container );
		} );

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
			A11yTribeEvents.OPEN_BUTTON_SELECTOR
		);

		if ( ! openButton ) return;

		openButton.addEventListener( 'click', () => {
			this.schedulePatch( wrapper, container );
		} );
	}

	// ============================================================================
	// ========================= Scheduling (rAF debounce) ==========================
	// ============================================================================
	private scheduleInit(): void {
		if ( this.initFrame ) {
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
		if ( pendingFrame ) {
			cancelAnimationFrame( pendingFrame );
		}

		const frame = requestAnimationFrame( () => {
			this.patchContainer( wrapper, container );
			this.rafByWrapper.delete( wrapper );
		} );

		this.rafByWrapper.set( wrapper, frame );
	}

	// ============================================================================
	// =============================== Patch chokepoint =============================
	// ============================================================================
	private patchContainer(
		wrapper: HTMLElement,
		container: HTMLElement
	): void {
		if ( ! wrapper || ! container ) return;
		if ( this.patchingWrappers.has( wrapper ) ) return;

		this.patchingWrappers.add( wrapper );

		try {
			const picker =
				container.querySelector< HTMLElement >( '.datepicker' );
			this.applyEnhancements( wrapper, picker );
		} finally {
			this.patchingWrappers.delete( wrapper );
		}
	}

	// ============================================================================
	// ============================ Observer bookkeeping ============================
	// ============================================================================
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

	// ============================================================================
	// ============================== The 5 enhancements ============================
	// ============================================================================
	/**
	 * Expose the datepicker's open/closed state to screen readers, mirroring
	 * the plugin's open-state modifier class onto `aria-expanded`.
	 */
	private syncOpenButtonExpanded( wrapper: HTMLElement ): void {
		if ( ! wrapper ) return;

		const openButton = wrapper.querySelector< HTMLElement >(
			A11yTribeEvents.OPEN_BUTTON_SELECTOR
		);

		if ( ! openButton ) return;

		const isOpen = openButton.classList.contains(
			A11yTribeEvents.OPEN_BUTTON_OPEN_CLASS
		);

		this.setAttributeIfChanged(
			openButton,
			'aria-expanded',
			isOpen ? 'true' : 'false'
		);
	}

	/** Prev-month button: Dutch `aria-label` + visually-hidden SR text. */
	private labelPrevButton( wrapper: HTMLElement, picker: HTMLElement ): void {
		this.setButtonLabel(
			picker.querySelector< HTMLElement >( 'button.prev' ),
			this.getLabel(
				wrapper,
				A11yTribeEvents.PREV_LABEL_ATTRIBUTE,
				A11yTribeEvents.FALLBACK_PREV_LABEL
			)
		);
	}

	/** Next-month button: Dutch `aria-label` + visually-hidden SR text. */
	private labelNextButton( wrapper: HTMLElement, picker: HTMLElement ): void {
		this.setButtonLabel(
			picker.querySelector< HTMLElement >( 'button.next' ),
			this.getLabel(
				wrapper,
				A11yTribeEvents.NEXT_LABEL_ATTRIBUTE,
				A11yTribeEvents.FALLBACK_NEXT_LABEL
			)
		);
	}

	/** Month/year switch button(s): Dutch `aria-label`. */
	private labelSwitchButton(
		wrapper: HTMLElement,
		picker: HTMLElement
	): void {
		const label = this.getLabel(
			wrapper,
			A11yTribeEvents.SWITCH_LABEL_ATTRIBUTE,
			A11yTribeEvents.FALLBACK_SWITCH_LABEL
		);

		picker
			.querySelectorAll< HTMLElement >( 'button.datepicker-switch' )
			.forEach( ( button ) => {
				this.setAttributeIfChanged( button, 'aria-label', label );
			} );
	}

	/**
	 * Day cells: `aria-selected` isn't valid on the button role; strip it.
	 */
	private stripInvalidDayAria( picker: HTMLElement ): void {
		const buttons = picker.querySelectorAll< HTMLElement >(
			A11yTribeEvents.DAY_BUTTON_WITH_ARIA_SELECTED_SELECTOR
		);

		buttons.forEach( ( button ) =>
			button.removeAttribute( 'aria-selected' )
		);
	}

	// ============================================================================
	// ============================== DOM write helpers =============================
	// ============================================================================
	private setButtonLabel( button: HTMLElement | null, label: string ): void {
		if ( ! button ) return;

		this.setAttributeIfChanged( button, 'aria-label', label );

		const srText = button.querySelector< HTMLElement >(
			'.tribe-common-a11y-visual-hide'
		);
		this.setTextIfChanged( srText, label );
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
