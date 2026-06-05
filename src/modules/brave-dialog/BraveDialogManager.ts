/**
 * Internal dependencies
 */
import { BraveDialog } from './BraveDialog';

interface BraveDialogManagerOptions {
	selector?: string;
}

export class BraveDialogManager {
	private readonly selector;
	private dialogs = new Map< string, BraveDialog >();

	constructor( options: BraveDialogManagerOptions = {} ) {
		this.selector = options.selector || '.js-brave-dialog';

		const dialogElements = document.querySelectorAll< HTMLDialogElement >(
			this.selector
		);

		dialogElements.forEach( ( dialog ) => {
			if ( ! dialog.id ) return;

			this.dialogs.set( dialog.id, new BraveDialog( dialog ) );
		} );
	}

	has( id: string ): boolean {
		return this.dialogs.has( id );
	}

	get( id: string ): BraveDialog | undefined {
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
