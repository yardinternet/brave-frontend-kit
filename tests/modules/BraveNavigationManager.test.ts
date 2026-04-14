import { describe, it, beforeEach, expect } from 'vitest';
import { BraveNavigationManager } from '@modules/BraveNavigationManager';

// ─── HTML fixtures ────────────────────────────────────────────────────────────

const singleNavHtml = /*html*/ `
	<nav class="brave-nav">
		<ul>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Item 1</a>
				<div class="brave-nav-dropdown">
					<a href="#">Sub 1</a>
				</div>
			</li>
		</ul>
	</nav>
`;

const multiNavHtml = /*html*/ `
	<nav class="brave-nav" id="nav1">
		<ul>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Nav 1 — Item 1</a>
				<div class="brave-nav-dropdown">
					<a href="#">Sub</a>
				</div>
			</li>
		</ul>
	</nav>
	<nav class="brave-nav" id="nav2">
		<ul>
			<li class="brave-nav-item">
				<a href="#" class="brave-nav-link-has-children">Nav 2 — Item 1</a>
				<div class="brave-nav-dropdown">
					<a href="#">Sub</a>
				</div>
			</li>
		</ul>
	</nav>
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function openDropdownByClick( link: HTMLAnchorElement ): void {
	link.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
}

function isExpanded( link: HTMLAnchorElement ): boolean {
	return link.getAttribute( 'aria-expanded' ) === 'true';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe( 'BraveNavigationManager', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'does not throw when there are no .brave-nav elements in the DOM', () => {
		expect( () => new BraveNavigationManager() ).not.toThrow();
	} );

	it( 'initialises a navigation for each .brave-nav element', () => {
		document.body.innerHTML = multiNavHtml;
		new BraveNavigationManager();

		// Both toggle links should have received accessibility attributes,
		// which proves BraveNavigation was constructed for each container.
		const links = document.querySelectorAll< HTMLAnchorElement >(
			'.brave-nav-link-has-children'
		);

		links.forEach( ( link ) => {
			expect( link.getAttribute( 'aria-haspopup' ) ).toBe( 'true' );
			expect( link.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );
	} );

	it( 'closes dropdowns across all navigations when Escape is pressed', () => {
		document.body.innerHTML = multiNavHtml;
		new BraveNavigationManager();

		const [ link1, link2 ] = [
			...document.querySelectorAll< HTMLAnchorElement >(
				'.brave-nav-link-has-children'
			),
		];

		openDropdownByClick( link1 );
		openDropdownByClick( link2 );

		expect( isExpanded( link1 ) ).toBe( true );
		expect( isExpanded( link2 ) ).toBe( true );

		// Dispatch on an HTML element so event.target has .closest and bubbles to document
		link1.dispatchEvent(
			new KeyboardEvent( 'keyup', { key: 'Escape', bubbles: true } )
		);

		expect( isExpanded( link1 ) ).toBe( false );
		expect( isExpanded( link2 ) ).toBe( false );
	} );

	it( 'closes dropdowns when clicking outside all navigations', () => {
		document.body.innerHTML = multiNavHtml;
		new BraveNavigationManager();

		const [ link1, link2 ] = [
			...document.querySelectorAll< HTMLAnchorElement >(
				'.brave-nav-link-has-children'
			),
		];

		openDropdownByClick( link1 );
		openDropdownByClick( link2 );

		// Click on an element that is outside both navigations
		const outside = document.createElement( 'button' );
		document.body.appendChild( outside );
		outside.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

		expect( isExpanded( link1 ) ).toBe( false );
		expect( isExpanded( link2 ) ).toBe( false );
	} );

	it( 'closes dropdowns when focus moves outside all navigations', () => {
		document.body.innerHTML = multiNavHtml;
		new BraveNavigationManager();

		const [ link1 ] = [
			...document.querySelectorAll< HTMLAnchorElement >(
				'.brave-nav-link-has-children'
			),
		];

		openDropdownByClick( link1 );

		// Move focus to an element outside all .brave-nav containers
		const outside = document.createElement( 'button' );
		document.body.appendChild( outside );
		outside.dispatchEvent( new FocusEvent( 'focusin', { bubbles: true } ) );

		expect( isExpanded( link1 ) ).toBe( false );
	} );

	it( 'keeps a dropdown open when a toggle link within the same navigation is focused', () => {
		document.body.innerHTML = singleNavHtml;
		new BraveNavigationManager();

		const container = document.querySelector( '.brave-nav' ) as HTMLElement;
		const link = container.querySelector< HTMLAnchorElement >(
			'.brave-nav-link-has-children'
		)!;

		openDropdownByClick( link );

		// Focus moves to an element still inside the same navigation container
		const insideElement = container.querySelector(
			'.brave-nav-dropdown a'
		) as HTMLElement;
		insideElement.dispatchEvent(
			new FocusEvent( 'focusin', { bubbles: true } )
		);

		expect( isExpanded( link ) ).toBe( true );
	} );
} );
