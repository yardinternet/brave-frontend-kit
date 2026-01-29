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

	constructor( private dialog: HTMLDialogElement ) {
		const focusTrapOptions: Options = {
			clickOutsideDeactivates: true,
			checkCanFocusTrap,
			onActivate: () => {
				this.dialog.showModal();
				disableBodyScroll( this.dialog );
			},
			onDeactivate: () => {
				this.dialog.close();
				enableBodyScroll( this.dialog );
			},
		};

		this.focusTrap = createFocusTrap( this.dialog, focusTrapOptions );
		this.initTriggers();
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
