import Headroom from 'headroom.js';

interface NavigationOptions {
	classOpenMenu?: string;
	headroomOptions?: object;
	selectorExpandableNavigationItems?: string;
	selectorHeader?: string;
	selectorNavigationItems?: string;
}

export class Navigation {
	private readonly classOpenMenu;
	private readonly clickedItems: Set< HTMLElement > = new Set();
	private readonly expandableNavigationItems;
	private readonly header;
	private readonly headroomOptions;
	private readonly navigationItems;
	private readonly selectorExpandableNavigationItems;
	private readonly selectorHeader;
	private readonly selectorNavigationItems;

	constructor( options: NavigationOptions = {} ) {
		this.selectorHeader = options.selectorHeader || '#js-brave-header';
		this.selectorNavigationItems =
			options.selectorNavigationItems || '.nav > .menu-item';
		this.selectorExpandableNavigationItems =
			options.selectorExpandableNavigationItems ||
			'.nav > .menu-item-has-children';
		this.headroomOptions = options.headroomOptions || {
			tolerance: {
				up: 10,
				down: 30,
			},
		};
		this.classOpenMenu = options.classOpenMenu || 'js-brave-show-sub-menu';

		this.header = document.querySelector< HTMLElement >(
			this.selectorHeader
		);
		this.navigationItems = document.querySelectorAll< HTMLElement >(
			this.selectorNavigationItems
		);
		this.expandableNavigationItems =
			document.querySelectorAll< HTMLElement >(
				this.selectorExpandableNavigationItems
			);

		this.bindEvents();
	}

	private bindEvents(): void {
		if ( ! this.header ) return;

		new Headroom( this.header, this.headroomOptions ).init();

		if ( this.navigationItems.length === 0 ) return;

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

		this.closeAllSubMenus();

		let item: Element | null = null;
		if ( event.target && event.target instanceof Element ) {
			item = event.target.closest( '.menu-item-has-children' );
		}
		if ( ! item ) return;

		const link = item.querySelector( 'a' );
		link?.focus();
	}

	/**
	 * Close expandable items if there is clicked somewhere which is not a menu item
	 */
	private onClickDocument( event: MouseEvent ): void {
		const isClickedOutside = Array.from( this.navigationItems ).every(
			( item ) => ! item.contains( event.target as Node )
		);

		if ( ! isClickedOutside ) return;
		this.closeAllSubMenus();
	}

	/**
	 * Close expandable items if the focus is somewhere which is not a sub menu
	 *
	 * @param {Event} event - The focusin event
	 */
	private onFocusIn( event: FocusEvent ): void {
		if (
			event.target &&
			event.target instanceof Element &&
			event.target.closest( '.sub-menu' )
		)
			return;

		this.closeAllSubMenus();
	}

	/**
	 * Initialize expandable menu items and add necessary aria attributes.
	 */
	private initExpandableMenuItems(): void {
		this.expandableNavigationItems.forEach( ( item ) => {
			const link = item.querySelector( 'a' );

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

	/**
	 * Close all expandable menu items
	 */
	private closeAllSubMenus(): void {
		this.clickedItems.clear();
		this.expandableNavigationItems.forEach( ( item ) => {
			const link = item.querySelector( 'a' );
			if ( link ) this.closeSubMenu( item, link );
		} );
	}
}
