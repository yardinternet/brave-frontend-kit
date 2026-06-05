import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { createFocusTrap, type Options, type FocusTrap } from 'focus-trap';
import { checkCanFocusTrap } from '@utils/focus-trap.ts';

interface MobileAnimate {
	keyframes?: Keyframe[] | PropertyIndexedKeyframes;
	options?: number | KeyframeAnimationOptions;
}

interface A11yMobileMenuOptions {
	selectorPrefix?: string;
	focusTrapOptions?: Options;
	onActivateFocusTrapAnimate?: MobileAnimate;
	onDeactivateFocusTrapAnimate?: MobileAnimate;
}

export class A11yMobileMenu {
	private focusTrapMobileMenu: FocusTrap | null = null;
	private readonly closeBtn: HTMLElement | null;
	private readonly hamburger: HTMLElement | null;
	private readonly mobileMenu: HTMLElement | null;
	private readonly expandableMenuItems: NodeListOf< Element >;
	private readonly selectorPrefix;
	private readonly focusTrapOptions;
	private readonly onActivateFocusTrapAnimate;
	private readonly onDeactivateFocusTrapAnimate;

	constructor( options: A11yMobileMenuOptions = {} ) {
		this.selectorPrefix = options.selectorPrefix || 'js-brave';
		this.onActivateFocusTrapAnimate = options.onActivateFocusTrapAnimate;
		this.onDeactivateFocusTrapAnimate =
			options.onDeactivateFocusTrapAnimate;

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

		this.focusTrapOptions = options.focusTrapOptions || {
			allowOutsideClick: true,
			checkCanFocusTrap,
			onActivate: (): void => this.onActivateFocusTrap(),
			onDeactivate: (): void => this.onDeactivateFocusTrap(),
		};

		this.bindEvents();
	}

	private bindEvents(): void {
		this.initExpandableMenuItems(); // @todo: is necessary for the new dialog mobile menu

		if ( ! this.closeBtn || ! this.hamburger || ! this.mobileMenu ) return;

		this.focusTrapMobileMenu = createFocusTrap(
			this.mobileMenu,
			this.focusTrapOptions
		);

		this.closeBtn.addEventListener(
			'click',
			() => this.focusTrapMobileMenu?.deactivate()
		);

		this.hamburger.addEventListener( 'click', () => {
			if ( this.focusTrapMobileMenu?.active ) {
				this.focusTrapMobileMenu?.deactivate();
			} else {
				this.focusTrapMobileMenu?.activate();
			}
		} );
	}

	/**
	 * Show mobile menu. Lock body scroll and add correct aria attributes.
	 */
	private onActivateFocusTrap(): void {
		disableBodyScroll( this.mobileMenu! );

		this.hamburger!.setAttribute( 'aria-expanded', 'true' );
		this.hamburger!.setAttribute( 'aria-label', 'Sluit menu' );

		this.mobileMenu!.animate(
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
		enableBodyScroll( this.mobileMenu! );

		this.closeAllExpandableMenuItems();

		/**
		 * This timeout is necessary to ensure that the aria-hidden attribute is set after the animation completes.
		 * This is a workaround for a known issue where setting aria-hidden on an element that has focus can cause accessibility issues.
		 */
		setTimeout( () => {
			this.hamburger!.setAttribute( 'aria-expanded', 'false' );
			this.hamburger!.setAttribute( 'aria-label', 'Open menu' );
		}, 1 );

		this.mobileMenu!.animate(
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
				this.onClickExpandableMenuItem( event, item, link )
			);
		} );
	}

	/**
	 * Handle click event. Prevent opening link, add aria-expanded and toggle class.
	 */
	private onClickExpandableMenuItem(
		event: Event,
		item: Element,
		link: HTMLAnchorElement
	): void {
		event.preventDefault();

		const isOpen = link.getAttribute( 'aria-expanded' ) === 'true';
		link.setAttribute( 'aria-expanded', String( ! isOpen ) );

		item.classList.toggle( `${ this.selectorPrefix }-show-sub-menu` );
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
			item.classList.remove( `${ this.selectorPrefix }-show-sub-menu` );
		} );
	}
}
