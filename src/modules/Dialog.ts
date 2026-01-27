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
	private readonly OPEN_BUTTON_SELECTOR = 'button[data-dialog-id]';
	private readonly CLOSE_BUTTON_SELECTOR = '.js-dialog-close-button';

	constructor() {
		const openButtons = this.getOpenButtons();
		if ( openButtons.length === 0 ) return;

		openButtons.forEach( ( openButton: HTMLButtonElement ) => {
			const dialogId = openButton.getAttribute( 'data-dialog-id' );
			if ( ! dialogId ) return;

			const dialogElement = document.getElementById( dialogId );
			if ( ! dialogElement ) return;

			this.initDialog( dialogElement as HTMLDialogElement, openButton );
		} );
	}

	private getOpenButtons(): NodeListOf< HTMLButtonElement > {
		return document.querySelectorAll< HTMLButtonElement >(
			this.OPEN_BUTTON_SELECTOR
		);
	}

	private initDialog(
		dialog: HTMLDialogElement,
		openButton: HTMLButtonElement
	): void {
		const focusTrapSettings: Options = {
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
			focusTrapSettings
		);

		openButton.addEventListener( 'click', (): void => {
			focusTrapDialog.activate();
		} );

		const closeButtons = dialog.querySelectorAll< HTMLElement >(
			this.CLOSE_BUTTON_SELECTOR
		);

		closeButtons.forEach( ( closeButton: HTMLElement ) => {
			closeButton.addEventListener( 'click', (): void => {
				focusTrapDialog.deactivate();
			} );
		} );
	}
}
