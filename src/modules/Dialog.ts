/**
 * External dependencies
 */
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { createFocusTrap, type Options, type FocusTrap } from 'focus-trap';

/**
 * Internal dependencies
 */
import { checkCanFocusTrap } from '@utils/focus-trap.ts';

export class Dialog {
	private focusTrap: FocusTrap;
	private useShow: boolean;

	constructor( private dialog: HTMLDialogElement ) {
		this.useShow = this.usesShow();

		const focusTrapOptions: Options = {
			clickOutsideDeactivates: true,
			checkCanFocusTrap,
			onActivate: () => {
				if ( this.useShow ) {
					this.dialog.show();
				} else {
					this.dialog.showModal();
					disableBodyScroll( this.dialog );
				}
			},
			onDeactivate: () => {
				this.dialog.close();
				if ( ! this.useShow ) {
					enableBodyScroll( this.dialog );
				}
			},
		};

		this.focusTrap = createFocusTrap( this.dialog, focusTrapOptions );
		this.initTriggers();
	}

	/**
	 * Use the `show()` method instead of `showModal()`, indicating a non-modal dialog.
	 */
	private usesShow(): boolean {
		return (
			this.dialog.hasAttribute( 'data-use-show' ) &&
			this.dialog.getAttribute( 'data-use-show' ) !== 'false'
		);
	}

	private initTriggers(): void {
		const triggers = document.querySelectorAll< HTMLElement >(
			`[data-dialog-id="${ this.dialog.id }"]`
		);

		triggers.forEach( ( trigger ) => {
			trigger.addEventListener( 'click', () => this.toggle() );
		} );
	}

	isActive(): boolean {
		return this.focusTrap.active;
	}

	open(): void {
		if ( ! this.isActive() ) {
			this.focusTrap.activate();
		}
	}

	close(): void {
		if ( this.isActive() ) {
			this.focusTrap.deactivate();
		}
	}

	toggle(): void {
		this.isActive() ? this.close() : this.open();
	}
}
