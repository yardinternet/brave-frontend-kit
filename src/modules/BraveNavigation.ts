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
	private readonly dropdownToggleLinks: NodeListOf< HTMLAnchorElement >;

	constructor( container: HTMLElement ) {
		this.container = container;

		this.dropdownToggleLinks =
			this.container.querySelectorAll< HTMLAnchorElement >(
				this.BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR
			);

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

		document.addEventListener( 'keyup', this.onKeyUp.bind( this ) );
		document.addEventListener( 'click', this.onClickDocument.bind( this ) );
		document.addEventListener( 'focusin', this.onFocusIn.bind( this ) );

		this.initExpandableMenuItems();
	}

	/**
	 * A11y: Check if escape key is pressed, then close all dropdowns set focus to parent link
	 */
	private onKeyUp( event: KeyboardEvent ): void {
		if ( event.key !== 'Escape' ) return;

		this.closeAllDropdowns();

		let item: Element | null = null;
		if ( event.target && event.target instanceof Element ) {
			item = event.target.closest(
				`${ this.BRAVE_NAV_ITEM_SELECTOR }:has(${ this.BRAVE_NAV_LINK_HAS_CHILDREN_SELECTOR })`
			);
		}
		if ( ! item ) return;

		const link = item.querySelector( 'a' );

		link?.focus();
	}

	/**
	 * Close dropdowns if clicked somewhere which is not inside the navigation container
	 */
	private onClickDocument( event: MouseEvent ): void {
		const target = event.target as Node;
		if ( ! this.container.contains( target ) ) {
			this.closeAllDropdowns();
		}
	}

	/**
	 * Close dropdowns if the focus moves outside.
	 */
	private onFocusIn( event: FocusEvent ): void {
		if (
			event.target &&
			event.target instanceof Element &&
			event.target.closest( this.BRAVE_DROPDOWN_SELECTOR )
		)
			return;

		this.closeAllDropdowns();
	}

	/**
	 * Initialize expandable menu items and add necessary aria attributes.
	 */
	private initExpandableMenuItems(): void {
		this.dropdownToggleLinks.forEach( ( link ) => {
			this.setupAccessibility( link );

			// Click works in both modes
			link.addEventListener( 'click', ( event ) =>
				this.onClickToggle( event, link )
			);

			if ( this.mode === 'hover' ) {
				// Hover events need to attach to <li> parent
				const li = link.closest< HTMLElement >(
					this.BRAVE_NAV_ITEM_SELECTOR
				);
				if ( ! li ) return;

				li.addEventListener( 'mouseenter', () =>
					this.openDropdown( link )
				);
				li.addEventListener( 'mouseleave', () => {
					if ( ! this.activeDropdownToggleLinks.has( link ) )
						this.closeDropdown( link );
				} );
			}
		} );
	}

	private setupAccessibility( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-haspopup', 'true' );
		link.setAttribute( 'aria-expanded', 'false' );
	}

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

		// Hover mode: click makes it persistent
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

		this.dropdownToggleLinks.forEach( ( link ) =>
			this.closeDropdown( link )
		);
	}
}
