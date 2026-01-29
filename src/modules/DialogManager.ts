/**
 * Internal dependencies
 */
import { Dialog } from './Dialog';

interface DialogManagerOptions {
	selector?: string;
}

export class DialogManager {
	private readonly selector;
	private dialogs = new Map< string, Dialog >();

	constructor( options: DialogManagerOptions = {} ) {
		this.selector = options.selector || '.js-brave-dialog';

		const dialogElements = document.querySelectorAll< HTMLDialogElement >(
			this.selector
		);

		dialogElements.forEach( ( dialog ) => {
			if ( ! dialog.id ) return;

			this.dialogs.set( dialog.id, new Dialog( dialog ) );
		} );
	}

	has( id: string ): boolean {
		return this.dialogs.has( id );
	}

	get( id: string ): Dialog | undefined {
		return this.dialogs.get( id );
	}

	open( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.open();
		}
	}

	close( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.close();
		}
	}

	toggle( id: string ): void {
		if ( this.has( id ) ) {
			this.get( id )!.toggle();
		}
	}

	closeAll(): void {
		this.dialogs.forEach( ( dialog ) => dialog.close() );
	}
}
