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
	private readonly expandableNavigationItems: NodeListOf< HTMLElement >;

	private readonly selectorNavigationItems: string;
	private readonly selectorExpandableNavigationItems: string;
	private readonly mode: DropdownMode;

	private readonly persistentItems: Set< HTMLElement > = new Set();

	constructor(
		container: HTMLElement,
		options: BraveNavigationOptions = {}
	) {
		this.container = container;

		this.selectorNavigationItems =
			options.selectorNavigationItems || '.brave-nav-item';
		this.selectorExpandableNavigationItems =
			options.selectorExpandableNavigationItems ||
			'.brave-nav-item-has-children';
		this.classOpenMenu = options.classOpenMenu || 'js-brave-show-sub-menu';

		this.navigationItems = this.container.querySelectorAll< HTMLElement >(
			this.selectorNavigationItems
		);
		this.expandableNavigationItems =
			this.container.querySelectorAll< HTMLElement >(
				this.selectorExpandableNavigationItems
			);

		this.mode = this.detectMode();

		this.bindEvents();
	}

	private detectMode(): DropdownMode {
		const hasClickDropdown = this.container.querySelector(
			'.brave-nav-dropdown-on-click'
		);

		if ( hasClickDropdown ) {
			return 'click';
		}

		return 'hover';
	}

	private bindEvents(): void {
		if ( ! this.navigationItems.length ) return;

		document.addEventListener( 'keyup', this.onKeyUp.bind( this ) );
		document.addEventListener( 'click', this.onClickDocument.bind( this ) );
		document.addEventListener( 'focusin', this.onFocusIn.bind( this ) );

		this.initExpandableMenuItems();
	}

	private onKeyUp( event: KeyboardEvent ): void {
		if ( event.key !== 'Escape' ) return;

		this.closeAllSubMenus();

		// Focus the first expanded link (if any)
		const firstOpenItem = Array.from( this.expandableNavigationItems ).find(
			( item ) => item.classList.contains( this.classOpenMenu )
		);
		const link =
			firstOpenItem?.querySelector< HTMLElement >( '.brave-nav-link' );
		link?.focus();
	}

	private onClickDocument( event: MouseEvent ): void {
		const target = event.target as Node;

		if ( ! this.container.contains( target ) ) {
			this.closeAllSubMenus();
		}
	}

	private onFocusIn( event: FocusEvent ): void {
		const target = event.target as Element;
		if ( ! target ) return;

		if ( target.closest( '.brave-nav-dropdown-on-hover' ) ) return;
		if ( ! this.container.contains( target ) ) return;

		this.closeAllSubMenus();
	}

	private initExpandableMenuItems(): void {
		this.expandableNavigationItems.forEach( ( item ) => {
			const link =
				item.querySelector< HTMLAnchorElement >( '.brave-nav-link' );

			if ( ! link ) return;

			this.setupAccessibility( link );

			// Click handler always exists, also in hover mode
			link.addEventListener( 'click', ( event ) =>
				this.onClickToggle( event, item, link )
			);

			if ( this.mode === 'hover' ) {
				item.addEventListener( 'mouseenter', () =>
					this.openSubMenu( item, link )
				);

				item.addEventListener( 'mouseleave', () => {
					// Only close if not persistently opened by click
					if ( ! this.persistentItems.has( item ) ) {
						this.closeSubMenu( item, link );
					}
				} );
			}
		} );
	}

	private setupAccessibility( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-haspopup', 'true' );
		link.setAttribute( 'aria-expanded', 'false' );
	}

	private onClickToggle(
		event: MouseEvent,
		item: HTMLElement,
		link: HTMLAnchorElement
	): void {
		const isOpen = link.getAttribute( 'aria-expanded' ) === 'true';

		// CLICK MODE -> behaves like mobile menu
		if ( this.mode === 'click' ) {
			event.preventDefault();
			event.stopPropagation();

			if ( isOpen ) {
				this.closeSubMenu( item, link );
			} else {
				this.closeAllSubMenus();
				this.openSubMenu( item, link );
			}

			return;
		}

		// HOVER MODE -> click makes it persistent
		if ( this.mode === 'hover' ) {
			event.stopPropagation();

			if ( isOpen ) {
				this.persistentItems.delete( item );
				this.closeSubMenu( item, link );
			} else {
				this.persistentItems.add( item );
				this.openSubMenu( item, link );
			}
		}
	}

	private openSubMenu( item: HTMLElement, link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'true' );
		item.classList.add( this.classOpenMenu );
	}

	private closeSubMenu( item: HTMLElement, link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'false' );
		item.classList.remove( this.classOpenMenu );
	}

	private closeAllSubMenus(): void {
		this.persistentItems.clear();

		this.expandableNavigationItems.forEach( ( item ) => {
			const link =
				item.querySelector< HTMLAnchorElement >( '.brave-nav-link' );

			if ( link ) {
				this.closeSubMenu( item, link );
			}
		} );
	}
}
