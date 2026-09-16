type DropdownMode = 'hover' | 'click';

const SELECTORS = {
	dropdown: '.brave-nav-dropdown',
	navItem: '.brave-nav-item',
	link: '.brave-nav-link',
	linkHasChildren: '.brave-nav-link-has-children',
} as const;

const NAV_KEYS: readonly string[] = [
	'ArrowDown',
	'ArrowRight',
	'ArrowUp',
	'ArrowLeft',
	'Home',
	'End',
];

const TOGGLE_ID_PREFIX = 'brave-nav-toggle-';
const DROPDOWN_ID_PREFIX = 'brave-nav-dropdown-';

export class BraveNavigation {
	private static uid = 0;

	private readonly mode: DropdownMode;

	private readonly activeDropdownToggleLinks: Set< HTMLAnchorElement > =
		new Set();

	private readonly container: HTMLElement;

	private readonly dropdownToggleLinks: HTMLAnchorElement[];

	constructor( container: HTMLElement ) {
		this.container = container;

		this.dropdownToggleLinks = [
			...this.container.querySelectorAll< HTMLAnchorElement >(
				SELECTORS.linkHasChildren
			),
		];

		this.mode = this.detectMode();

		this.bindEvents();
	}

	private detectMode(): DropdownMode {
		const dropdown = this.container.querySelector< HTMLElement >(
			SELECTORS.dropdown
		);

		const mode = dropdown?.dataset.mode;

		return mode === 'hover' ? 'hover' : 'click';
	}

	private bindEvents(): void {
		if ( ! this.dropdownToggleLinks.length ) return;

		this.initExpandableMenuItems();

		// Event delegation for clicks
		this.container.addEventListener( 'click', this.onContainerClick );
		this.container.addEventListener( 'keydown', this.onKeyDown );

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
			const li = link.closest< HTMLElement >( SELECTORS.navItem );

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

	/**
	 * A11y: disclosure semantics per the APG disclosure navigation pattern.
	 * No aria-haspopup: that announces an application menu and makes screen
	 * readers instruct arrow-key behavior that a site nav does not have.
	 *
	 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
	 */
	private setupAccessibility( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-expanded', 'false' );

		const dropdown = link
			.closest( SELECTORS.navItem )
			?.querySelector( SELECTORS.dropdown );

		if ( ! dropdown ) return;

		BraveNavigation.uid += 1;
		link.id ||= TOGGLE_ID_PREFIX + BraveNavigation.uid;
		dropdown.id ||= DROPDOWN_ID_PREFIX + BraveNavigation.uid;

		dropdown.setAttribute( 'aria-labelledby', link.id );
		link.setAttribute( 'aria-controls', dropdown.id );
	}

	/**
	 * Event delegation handler for click events inside the navigation
	 */
	private onContainerClick = ( event: MouseEvent ): void => {
		const target = event.target as HTMLElement;

		const link = target.closest(
			SELECTORS.linkHasChildren
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

	/**
	 * A11y: optional arrow key supplement from the APG disclosure navigation
	 * pattern. Tab order stays untouched.
	 */
	private onKeyDown = ( event: KeyboardEvent ): void => {
		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey )
			return;
		if ( ! NAV_KEYS.includes( event.key ) ) return;

		const target = ( event.target as HTMLElement | null )?.closest(
			SELECTORS.link
		) as HTMLElement | null;

		if ( ! target ) return;

		const links = this.linksAround( target );
		const next = this.nextLink(
			event.key,
			links,
			links.indexOf( target ),
			this.firstExpandedLink( target )
		);

		if ( ! next ) return;

		event.preventDefault();
		next.focus();
	};

	/**
	 * The links the target navigates between: its own dropdown when inside
	 * one, the top-level links otherwise.
	 */
	private linksAround( target: HTMLElement ): HTMLElement[] {
		const dropdown = target.closest< HTMLElement >( SELECTORS.dropdown );

		if ( dropdown ) {
			return [
				...dropdown.querySelectorAll< HTMLElement >( SELECTORS.link ),
			];
		}

		return [
			...this.container.querySelectorAll< HTMLElement >( SELECTORS.link ),
		].filter( ( link ) => ! link.closest( SELECTORS.dropdown ) );
	}

	/**
	 * The first link inside the target's own expanded dropdown, if any.
	 */
	private firstExpandedLink( target: HTMLElement ): HTMLElement | null {
		if ( target.getAttribute( 'aria-expanded' ) !== 'true' ) return null;

		const dropdownId = target.getAttribute( 'aria-controls' );
		if ( ! dropdownId ) return null;

		return (
			document
				.getElementById( dropdownId )
				?.querySelector< HTMLElement >( SELECTORS.link ) ?? null
		);
	}

	private nextLink(
		key: string,
		links: HTMLElement[],
		index: number,
		expandedLink: HTMLElement | null
	): HTMLElement | undefined {
		switch ( key ) {
			case 'ArrowDown':
			case 'ArrowRight':
				return expandedLink ?? links[ index + 1 ];
			case 'ArrowUp':
			case 'ArrowLeft':
				return links[ index - 1 ];
			case 'Home':
				return links[ 0 ];
			case 'End':
				return links[ links.length - 1 ];
			default:
				return undefined;
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
			SELECTORS.dropdown
		) as HTMLElement | null;

		if ( ! dropdown ) return;

		const navItem = dropdown.closest( SELECTORS.navItem );

		if ( ! navItem ) return;

		const toggle = navItem.querySelector(
			SELECTORS.linkHasChildren
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
		if ( this.mode === 'hover' && target.closest( SELECTORS.dropdown ) )
			return;

		this.closeAllDropdowns();
	}
}
