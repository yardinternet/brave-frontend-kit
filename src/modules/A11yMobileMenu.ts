import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import * as focusTrap from 'focus-trap';
import { checkCanFocusTrap } from '@utils/focus-trap.ts';

interface MobileAnimate {
	keyframes?: Keyframe[] | PropertyIndexedKeyframes;
	options?: number | KeyframeAnimationOptions;
}

interface A11yMobileMenuOptions {
	selectorPrefix?: string;
	focusTrapOptions?: focusTrap.Options;
	onActivateFocusTrapAnimate?: MobileAnimate;
	onDeactivateFocusTrapAnimate?: MobileAnimate;
}

export class A11yMobileMenu {
	private focusTrapMobileMenu: focusTrap.FocusTrap | null = null;
	private closeBtn: HTMLElement | null;
	private hamburger: HTMLElement | null;
	private mobileMenu: HTMLElement | null;
	private expandableMenuItems: NodeListOf< Element >;
	private focusTrapOptions: focusTrap.Options;
	private onDeactivateFocusTrapAnimate: MobileAnimate | null;
	private onActivateFocusTrapAnimate: MobileAnimate | null;

	public readonly selectorPrefix: string;

	constructor(
		options: A11yMobileMenuOptions = {
			focusTrapOptions: {
				allowOutsideClick: true,
				checkCanFocusTrap,
				onActivate: () => this.onActivateFocusTrap(),
				onDeactivate: () => this.onDeactivateFocusTrap(),
			},
		}
	) {
		this.selectorPrefix = options.selectorPrefix || 'js-brave';
		this.onActivateFocusTrapAnimate =
			options?.onActivateFocusTrapAnimate || null;
		this.onDeactivateFocusTrapAnimate =
			options?.onDeactivateFocusTrapAnimate || null;

		this.closeBtn = document.querySelector(
			`#${ this.selectorPrefix }-mobile-menu-close-btn`
		);
		this.hamburger = document.querySelector(
			`#${ this.selectorPrefix }-hamburger`
		);
		this.mobileMenu = document.querySelector(
			`#${ this.selectorPrefix }-mobile-menu`
		);
		this.expandableMenuItems = document.querySelectorAll(
			'.mobile-menu .menu-item-has-children'
		);

		this.focusTrapOptions = options.focusTrapOptions;

		this.bindEvents();
	}

	private bindEvents(): void {
		if ( ! this.closeBtn || ! this.hamburger || ! this.mobileMenu ) return;

		this.focusTrapMobileMenu = focusTrap.createFocusTrap(
			this.mobileMenu,
			this.focusTrapOptions
		);

		this.closeBtn.addEventListener(
			'click',
			() => this.focusTrapMobileMenu?.deactivate()
		);
		this.hamburger.addEventListener( 'click', () => {
			if ( this.focusTrapMobileMenu?.active ) {
				this.focusTrapMobileMenu.deactivate();
			} else {
				this.focusTrapMobileMenu?.activate();
			}
		} );

		this.initExpandableMenuItems();
	}

	/**
	 * Show mobile menu. Lock body scroll and add correct aria attributes.
	 */
	private onActivateFocusTrap(): void {
		if ( ! this.mobileMenu || ! this.hamburger ) return;

		disableBodyScroll( this.mobileMenu );

		this.hamburger.setAttribute( 'aria-expanded', 'true' );
		this.hamburger.setAttribute( 'aria-label', 'Sluit menu' );
		this.mobileMenu.setAttribute( 'aria-hidden', 'false' );

		this.mobileMenu.animate(
			this.onActivateFocusTrapAnimate?.keyframes ?? [
				{
					transform: 'translateX(100%)',
					opacity: '0',
					visibility: 'hidden',
				},
				{
					transform: 'translateX(0)',
					opacity: '1',
					visibility: 'visible',
				},
			],
			this.onActivateFocusTrapAnimate?.options ?? {
				duration: 500,
				easing: 'cubic-bezier(0.22,1,0.36,1)',
				fill: 'both',
			}
		);
	}

	/**
	 * Hide mobile menu. Unlock body scroll and add correct aria attributes.
	 */
	public onDeactivateFocusTrap(): void {
		if ( ! this.mobileMenu || ! this.hamburger ) return;

		enableBodyScroll( this.mobileMenu );

		this.closeAllExpandableMenuItems();

		this.hamburger.setAttribute( 'aria-expanded', 'false' );
		this.hamburger.setAttribute( 'aria-label', 'Open menu' );
		this.mobileMenu.setAttribute( 'aria-hidden', 'true' );

		this.mobileMenu.animate(
			this.onDeactivateFocusTrapAnimate?.keyframes ?? [
				{
					transform: 'translateX(0)',
					opacity: '1',
					visibility: 'visible',
				},
				{
					transform: 'translateX(100%)',
					opacity: '0',
					visibility: 'hidden',
				},
			],
			this.onDeactivateFocusTrapAnimate?.options ?? {
				duration: 500,
				easing: 'ease-out',
				fill: 'both',
			}
		);
	}

	/**
	 * Initialize expandable menu items and add necessary aria attributes.
	 */
	private initExpandableMenuItems(): void {
		this.expandableMenuItems.forEach( ( item ) => {
			const link = item.querySelector( 'a' );
			if ( ! link ) return;

			link.setAttribute( 'aria-haspopup', 'true' );
			link.setAttribute( 'aria-expanded', 'false' );

			link.addEventListener( 'click', ( event ) =>
				this.onClickExpandableMenuItem(
					event,
					item,
					link as HTMLElement
				)
			);
		} );
	}

	/**
	 * Handle click event. Prevent opening link, add aria-expanded and toggle class.
	 */
	private onClickExpandableMenuItem(
		event: Event,
		item: Element,
		link: HTMLElement
	): void {
		event.preventDefault();

		const isOpen = link.getAttribute( 'aria-expanded' ) === 'true';
		link.setAttribute( 'aria-expanded', String( ! isOpen ) );

		item.classList.toggle( `#${ this.selectorPrefix }-show-sub-menu` );
	}

	/**
	 * Close all expandable menu items. Set aria-expanded to false and remove active class.
	 */
	private closeAllExpandableMenuItems(): void {
		this.expandableMenuItems.forEach( ( item ) => {
			const link = item.querySelector( 'a' );
			if ( link ) {
				link.setAttribute( 'aria-expanded', 'false' );
			}
			item.classList.remove( `#${ this.selectorPrefix }-show-sub-menu` );
		} );
	}
}
