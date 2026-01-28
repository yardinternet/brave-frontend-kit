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
	private readonly DIALOG_SELECTOR = '.js-brave-dialog';

	constructor() {
		const dialogs = document.querySelectorAll< HTMLDialogElement >(
			this.DIALOG_SELECTOR
		);

		dialogs.forEach( ( dialog ) => this.initDialog( dialog ) );
	}

	private initDialog( dialog: HTMLDialogElement ): void {
		const focusTrapOptions: Options = {
			clickOutsideDeactivates: true,
			checkCanFocusTrap,
			onActivate: (): void => {
				dialog.showModal();
				disableBodyScroll( dialog );
			},
			onDeactivate: (): void => {
				dialog.close();
				enableBodyScroll( dialog );
			},
		};

		const focusTrapDialog: FocusTrap = createFocusTrap(
			dialog,
			focusTrapOptions
		);

		this.initDialogTriggers( dialog, focusTrapDialog );
	}

	private initDialogTriggers(
		dialog: HTMLDialogElement,
		focusTrapDialog: FocusTrap
	): void {
		const triggers = document.querySelectorAll< HTMLElement >(
			`[data-dialog-id="${ dialog.id }"]`
		);

		triggers.forEach( ( trigger: HTMLElement ) => {
			trigger.addEventListener( 'click', (): void => {
				if ( focusTrapDialog.active ) {
					focusTrapDialog.deactivate();
				} else {
					focusTrapDialog.activate();
				}
			} );
		} );
	}
}
