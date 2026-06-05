type DropdownMode = 'hover' | 'click';

export class BraveNavigation {
	private readonly BRAVE_DROPDOWN_SELECTOR = '.brave-nav-dropdown';
	private readonly BRAVE_NAV_ITEM_SELECTOR = '.brave-nav-item';
	private readonly BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR =
		'.brave-nav-link-has-children';

	private readonly mode: DropdownMode;

	private readonly activeDropdownToggleLinks: Set< HTMLAnchorElement > =
		new Set();

	private readonly container: HTMLElement;

	private readonly dropdownToggleLinks: HTMLAnchorElement[];

	constructor( container: HTMLElement ) {
		this.container = container;

		this.dropdownToggleLinks = [
			...this.container.querySelectorAll< HTMLAnchorElement >(
				this.BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR
			),
		];

		this.mode = this.detectMode();

		this.bindEvents();
	}

	private detectMode(): DropdownMode {
		const dropdown = this.container.querySelector< HTMLElement >(
			this.BRAVE_DROPDOWN_SELECTOR
		);

		const mode = dropdown?.dataset.mode;

		return mode === 'hover' ? 'hover' : 'click';
	}

	private bindEvents(): void {
		if ( ! this.dropdownToggleLinks.length ) return;

		this.initExpandableMenuItems();

		// Event delegation for clicks
		this.container.addEventListener( 'click', this.onContainerClick );

		if ( this.mode === 'hover' ) {
			this.initHoverEvents();
		}
	}

	private initExpandableMenuItems(): void {
		this.dropdownToggleLinks.forEach( ( link ) => {
			this.setupAccessibility( link );
		} );
	}

	private initHoverEvents(): void {
		this.dropdownToggleLinks.forEach( ( link ) => {
			const li = link.closest< HTMLElement >(
				this.BRAVE_NAV_ITEM_SELECTOR
			);

			if ( ! li ) return;

			li.addEventListener( 'mouseenter', () =>
				this.openDropdown( link )
			);

			li.addEventListener( 'mouseleave', () => {
				if ( ! this.activeDropdownToggleLinks.has( link ) ) {
					this.closeDropdown( link );
				}
			} );
		} );
	}

	private setupAccessibility( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-haspopup', 'true' );
		link.setAttribute( 'aria-expanded', 'false' );
	}

	/**
	 * Event delegation handler for click events inside the navigation
	 */
	private onContainerClick = ( event: MouseEvent ): void => {
		const target = event.target as HTMLElement;

		const link = target.closest(
			this.BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR
		) as HTMLAnchorElement | null;

		if ( ! link || ! this.container.contains( link ) ) return;

		this.onClickToggle( event, link );
	};

	private onClickToggle( event: MouseEvent, link: HTMLAnchorElement ): void {
		const isOpen = link.getAttribute( 'aria-expanded' ) === 'true';

		if ( this.mode === 'click' ) {
			event.preventDefault();
			event.stopPropagation();

			if ( isOpen ) {
				this.closeDropdown( link );
			} else {
				this.closeAllDropdowns();
				this.openDropdown( link );
			}

			return;
		}

		if ( this.mode === 'hover' ) {
			event.stopPropagation();

			if ( isOpen ) {
				this.activeDropdownToggleLinks.delete( link );
				this.closeDropdown( link );
			} else {
				this.activeDropdownToggleLinks.add( link );
				this.openDropdown( link );
			}
		}
	}

	private openDropdown( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'true' );
	}

	private closeDropdown( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'false' );
	}

	/**
	 * Close all dropdowns
	 */
	private closeAllDropdowns(): void {
		this.activeDropdownToggleLinks.clear();

		this.dropdownToggleLinks.forEach( ( link ) => {
			this.closeDropdown( link );
		} );
	}

	/**
	 * A11y: Check if escape key is pressed, then close all dropdowns
	 * and set focus to parent link
	 */
	public onKeyUp( event: KeyboardEvent ): void {
		if ( event.key !== 'Escape' ) return;

		this.closeAllDropdowns();

		const target = event.target as HTMLElement | null;
		if ( ! target ) return;

		const dropdown = target.closest(
			this.BRAVE_DROPDOWN_SELECTOR
		) as HTMLElement | null;

		if ( ! dropdown ) return;

		const navItem = dropdown.closest( this.BRAVE_NAV_ITEM_SELECTOR );

		if ( ! navItem ) return;

		const toggle = navItem.querySelector(
			this.BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR
		) as HTMLAnchorElement | null;

		toggle?.focus();
	}

	/**
	 * Close dropdowns if clicked somewhere outside this navigation
	 */
	public onClickDocument( event: MouseEvent ): void {
		const target = event.target as Node;

		if ( ! this.container.contains( target ) ) {
			this.closeAllDropdowns();
		}
	}

	/**
	 * Close dropdowns when focus leaves the navigation.
	 *
	 * Click mode: closes only when focus leaves the container entirely, so
	 * tapping between toggle buttons doesn't fight the click handler.
	 * Hover mode: closes when focus leaves any open dropdown, so keyboard
	 * users can Tab out to dismiss.
	 */
	public onFocusIn( event: FocusEvent ): void {
		const target = event.target;

		if ( ! ( target instanceof Element ) ) return;

		if ( this.mode === 'click' && this.container.contains( target ) )
			return;
		if (
			this.mode === 'hover' &&
			target.closest( this.BRAVE_DROPDOWN_SELECTOR )
		)
			return;

		this.closeAllDropdowns();
	}
}
