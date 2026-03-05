export interface BraveNavigationOptions {
	classOpenMenu?: string;
	selectorNavigationItems?: string;
	selectorExpandableNavigationItems?: string;
}

type DropdownMode = 'hover' | 'click';

export class BraveNavigation {
	private readonly container: HTMLElement;
	private readonly classOpenMenu: string;

	private readonly navigationItems: NodeListOf< HTMLElement >;
	private readonly expandableNavigationItems: NodeListOf< HTMLAnchorElement >;

	private readonly selectorNavigationItems: string;
	private readonly selectorExpandableNavigationItems: string;
	private readonly mode: DropdownMode;

	private readonly persistentItems: Set< HTMLAnchorElement > = new Set();

	constructor(
		container: HTMLElement,
		options: BraveNavigationOptions = {}
	) {
		this.container = container;

		// Regular nav items
		this.selectorNavigationItems =
			options.selectorNavigationItems || '.brave-nav-item';

		this.selectorExpandableNavigationItems =
			options.selectorExpandableNavigationItems ||
			'.brave-nav-link-has-children';

		this.classOpenMenu = options.classOpenMenu || 'js-brave-show-dropdown';

		this.navigationItems = this.container.querySelectorAll< HTMLElement >(
			this.selectorNavigationItems
		);
		this.expandableNavigationItems =
			this.container.querySelectorAll< HTMLAnchorElement >(
				this.selectorExpandableNavigationItems
			);

		this.mode = this.detectMode();

		this.bindEvents();
	}

	private detectMode(): DropdownMode {
		const dropdown = this.container.querySelector< HTMLElement >(
			'.brave-nav-dropdown'
		);

		const mode = dropdown?.dataset.mode;

		return mode === 'hover' ? 'hover' : 'click';
	}

	private bindEvents(): void {
		if ( ! this.navigationItems.length ) return;

		document.addEventListener( 'keyup', this.onKeyUp.bind( this ) );
		document.addEventListener( 'click', this.onClickDocument.bind( this ) );
		document.addEventListener( 'focusin', this.onFocusIn.bind( this ) );

		this.initExpandableMenuItems();
	}

	/**
	 * A11y: Check if escape key is pressed, then close all expandable items and set focus to parent link
	 */
	private onKeyUp( event: KeyboardEvent ): void {
		if ( event.key !== 'Escape' ) return;

		this.closeAllDropdowns();

		let item: Element | null = null;
		if ( event.target && event.target instanceof Element ) {
			item = event.target.closest(
				'.brave-nav-item:has(.brave-nav-link-has-children)'
			);
		}
		if ( ! item ) return;

		const link = item.querySelector( 'a' );

		link?.focus();
	}

	/**
	 * Close expandable items if there is clicked somewhere which is not a menu item
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
			event.target.closest( '.brave-nav-dropdown' )
		)
			return;

		this.closeAllDropdowns();
	}

	/**
	 * Initialize expandable menu items and add necessary aria attributes.
	 */
	private initExpandableMenuItems(): void {
		this.expandableNavigationItems.forEach( ( link ) => {
			this.setupAccessibility( link );

			// Click toggle works in both modes
			link.addEventListener( 'click', ( event ) =>
				this.onClickToggle( event, link )
			);

			if ( this.mode === 'hover' ) {
				// Hover events need to attach to <li> parent
				const li = link.closest< HTMLElement >(
					this.selectorNavigationItems
				);
				if ( ! li ) return;

				li.addEventListener( 'mouseenter', () =>
					this.openDropdown( link )
				);
				li.addEventListener( 'mouseleave', () => {
					if ( ! this.persistentItems.has( link ) )
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
				this.persistentItems.delete( link );
				this.closeDropdown( link );
			} else {
				this.persistentItems.add( link );
				this.openDropdown( link );
			}
		}
	}

	private openDropdown( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'true' );
		link.classList.add( this.classOpenMenu );
	}

	private closeDropdown( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'false' );
		link.classList.remove( this.classOpenMenu );
	}

	/**
	 * Close all dropdowns
	 */
	private closeAllDropdowns(): void {
		this.persistentItems.clear();

		this.expandableNavigationItems.forEach( ( link ) =>
			this.closeDropdown( link )
		);
	}
}
