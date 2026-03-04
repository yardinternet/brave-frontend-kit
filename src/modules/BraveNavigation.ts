// BraveNavigation.ts
export interface BraveNavigationOptions {
	classOpenMenu?: string;
	selectorNavigationItems?: string;
	selectorExpandableNavigationItems?: string;
}

export class BraveNavigation {
	private readonly container: HTMLElement;
	private readonly classOpenMenu: string;
	private readonly clickedItems: Set< HTMLElement > = new Set();
	private readonly navigationItems: NodeListOf< HTMLElement >;
	private readonly expandableNavigationItems: NodeListOf< HTMLElement >;

	private readonly selectorNavigationItems: string;
	private readonly selectorExpandableNavigationItems: string;

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

		this.bindEvents();
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

		// Only close menus in this nav
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

			link.setAttribute( 'aria-haspopup', 'true' );
			link.setAttribute( 'aria-expanded', 'false' );

			link.addEventListener( 'click', ( event ) =>
				this.onClickLink( event, item, link )
			);

			item.addEventListener( 'mouseenter', () =>
				this.openSubMenu( item, link )
			);
			item.addEventListener( 'mouseleave', () => {
				if ( ! this.clickedItems.has( item ) )
					this.closeSubMenu( item, link );
			} );
		} );
	}

	private onClickLink(
		event: MouseEvent,
		item: HTMLElement,
		link: HTMLAnchorElement
	): void {
		event.preventDefault();
		event.stopPropagation();

		const isOpen = link.getAttribute( 'aria-expanded' ) === 'true';
		if ( isOpen ) {
			this.clickedItems.delete( item );
			this.closeSubMenu( item, link );
		} else {
			this.clickedItems.add( item );
			this.openSubMenu( item, link );
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
		this.clickedItems.clear();
		this.expandableNavigationItems.forEach( ( item ) => {
			const link =
				item.querySelector< HTMLAnchorElement >( '.brave-nav-link' );
			if ( link ) this.closeSubMenu( item, link );
		} );
	}
}
