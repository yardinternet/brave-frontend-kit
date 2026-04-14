import { describe, it, beforeEach, expect } from 'vitest';
import { BraveNavigation } from '@modules/BraveNavigation';

// ─── HTML fixtures ────────────────────────────────────────────────────────────

const clickModeHtml = /*html*/ `
	<nav class="brave-nav">
		<ul>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Item 1</a>
				<div class="brave-nav-dropdown">
					<a href="#">Sub 1</a>
				</div>
			</li>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Item 2</a>
				<div class="brave-nav-dropdown">
					<a href="#">Sub 2</a>
				</div>
			</li>
		</ul>
	</nav>
`;

const hoverModeHtml = /*html*/ `
	<nav class="brave-nav">
		<ul>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Item 1</a>
				<div class="brave-nav-dropdown" data-mode="hover">
					<a href="#">Sub 1</a>
				</div>
			</li>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Item 2</a>
				<div class="brave-nav-dropdown" data-mode="hover">
					<a href="#">Sub 2</a>
				</div>
			</li>
		</ul>
	</nav>
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setup( html: string ): {
	nav: BraveNavigation;
	container: HTMLElement;
	links: HTMLAnchorElement[];
	dropdowns: HTMLElement[];
} {
	document.body.innerHTML = html;

	const container = document.querySelector( '.brave-nav' ) as HTMLElement;
	const nav = new BraveNavigation( container );
	const links = [
		...container.querySelectorAll< HTMLAnchorElement >(
			'.brave-nav-link-has-children'
		),
	];
	const dropdowns = [
		...container.querySelectorAll< HTMLElement >( '.brave-nav-dropdown' ),
	];

	return { nav, container, links, dropdowns };
}

function clickLink( link: HTMLAnchorElement ): void {
	link.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
}

function isExpanded( link: HTMLAnchorElement ): boolean {
	return link.getAttribute( 'aria-expanded' ) === 'true';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe( 'BraveNavigation — initialization', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'sets aria-haspopup on all toggle links', () => {
		const { links } = setup( clickModeHtml );

		links.forEach( ( link ) => {
			expect( link.getAttribute( 'aria-haspopup' ) ).toBe( 'true' );
		} );
	} );

	it( 'sets aria-expanded to false on all toggle links', () => {
		const { links } = setup( clickModeHtml );

		links.forEach( ( link ) => {
			expect( link.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );
	} );

	it( 'does not throw when there are no toggle links', () => {
		document.body.innerHTML = /*html*/ `<nav class="brave-nav"></nav>`;
		const container = document.querySelector( '.brave-nav' ) as HTMLElement;

		expect( () => new BraveNavigation( container ) ).not.toThrow();
	} );
} );

// ─── Click mode ───────────────────────────────────────────────────────────────

describe( 'BraveNavigation — click mode', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'opens a dropdown when its toggle link is clicked', () => {
		const { links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'closes an open dropdown when its toggle link is clicked again', () => {
		const { links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );
		clickLink( links[ 0 ] );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'closes other open dropdowns when a new one is opened', () => {
		const { links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );
		clickLink( links[ 1 ] );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
		expect( isExpanded( links[ 1 ] ) ).toBe( true );
	} );

	it( 'prevents default navigation when clicking a toggle link', () => {
		const { links } = setup( clickModeHtml );

		const event = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true,
		} );
		links[ 0 ].dispatchEvent( event );

		expect( event.defaultPrevented ).toBe( true );
	} );

	it( 'closes all dropdowns on Escape key press', () => {
		const { nav, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );
		nav.onKeyUp( new KeyboardEvent( 'keyup', { key: 'Escape' } ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'does not close dropdowns on other key presses', () => {
		const { nav, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );
		nav.onKeyUp( new KeyboardEvent( 'keyup', { key: 'Enter' } ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'moves focus to the toggle link when Escape is pressed inside its dropdown', () => {
		const { nav, container, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		const subLink = container.querySelector(
			'.brave-nav-dropdown a'
		) as HTMLAnchorElement;

		// Simulate focus inside the dropdown
		subLink.focus();

		nav.onKeyUp(
			new KeyboardEvent( 'keyup', { key: 'Escape', bubbles: true } )
		);

		// The target of the event must be the focused element inside the dropdown
		const eventWithTarget = new KeyboardEvent( 'keyup', {
			key: 'Escape',
			bubbles: true,
		} );
		Object.defineProperty( eventWithTarget, 'target', { value: subLink } );
		nav.onKeyUp( eventWithTarget );

		// eslint-disable-next-line @wordpress/no-global-active-element
		expect( document.activeElement ).toBe( links[ 0 ] );
	} );

	it( 'closes all dropdowns when clicking outside the navigation', () => {
		const { nav, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		const outside = document.createElement( 'button' );
		document.body.appendChild( outside );
		nav.onClickDocument( new MouseEvent( 'click', { bubbles: true } ) );

		// Simulate the click target being the outside element
		const event = new MouseEvent( 'click', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: outside } );
		nav.onClickDocument( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'keeps dropdowns open when clicking inside the navigation', () => {
		const { nav, container, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		// Click on an element that is inside the container
		const insideElement = container.querySelector(
			'.brave-nav-dropdown a'
		) as HTMLElement;
		const event = new MouseEvent( 'click', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: insideElement } );
		nav.onClickDocument( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'closes all dropdowns when focus moves outside the container', () => {
		const { nav, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		const outsideButton = document.createElement( 'button' );
		document.body.appendChild( outsideButton );

		const event = new FocusEvent( 'focusin', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: outsideButton } );
		nav.onFocusIn( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'keeps dropdowns open when focus remains within the container', () => {
		const { nav, container, links } = setup( clickModeHtml );

		clickLink( links[ 0 ] );

		const insideElement = container.querySelector(
			'.brave-nav-dropdown a'
		) as HTMLElement;
		const event = new FocusEvent( 'focusin', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: insideElement } );
		nav.onFocusIn( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );
} );

// ─── Hover mode ───────────────────────────────────────────────────────────────

describe( 'BraveNavigation — hover mode', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'opens dropdown on mouseenter of the nav item', () => {
		const { links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;
		navItem.dispatchEvent( new MouseEvent( 'mouseenter' ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'closes dropdown on mouseleave of the nav item when not pinned open', () => {
		const { links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;
		navItem.dispatchEvent( new MouseEvent( 'mouseenter' ) );
		navItem.dispatchEvent( new MouseEvent( 'mouseleave' ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'pins dropdown open on click and prevents mouseleave from closing it', () => {
		const { links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;

		// Click when closed → opens AND pins (adds to activeDropdownToggleLinks)
		clickLink( links[ 0 ] );

		// Mouseleave should NOT close the pinned dropdown
		navItem.dispatchEvent( new MouseEvent( 'mouseleave' ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'closes pinned dropdown when the toggle link is clicked again', () => {
		const { links } = setup( hoverModeHtml );

		clickLink( links[ 0 ] ); // click when closed → pin open
		clickLink( links[ 0 ] ); // click when open → unpin + close

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'closes all dropdowns on Escape key press', () => {
		const { nav, links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;
		navItem.dispatchEvent( new MouseEvent( 'mouseenter' ) );

		nav.onKeyUp( new KeyboardEvent( 'keyup', { key: 'Escape' } ) );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );

	it( 'keeps dropdown open when focus moves inside the dropdown', () => {
		const { nav, container, links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;
		navItem.dispatchEvent( new MouseEvent( 'mouseenter' ) );

		const subLink = container.querySelectorAll(
			'.brave-nav-dropdown a'
		)[ 0 ] as HTMLElement;
		const event = new FocusEvent( 'focusin', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: subLink } );
		nav.onFocusIn( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( true );
	} );

	it( 'closes dropdown when focus moves to another toggle link (outside the dropdown)', () => {
		const { nav, links } = setup( hoverModeHtml );

		const navItem = links[ 0 ].closest( '.brave-nav-item' ) as HTMLElement;
		navItem.dispatchEvent( new MouseEvent( 'mouseenter' ) );

		// Focus goes to the second toggle link (not inside a dropdown)
		const event = new FocusEvent( 'focusin', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: links[ 1 ] } );
		nav.onFocusIn( event );

		expect( isExpanded( links[ 0 ] ) ).toBe( false );
	} );
} );
