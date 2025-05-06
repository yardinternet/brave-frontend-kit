interface WebShareApiOptions {
	selector?: string;
}

export class WebShareApi {
	private selector: string;

	constructor( options: WebShareApiOptions = {} ) {
		this.selector = options.selector || '.js-web-share-api';
		this.init();
	}

	private init() {
		const buttons = document.querySelectorAll< HTMLButtonElement >(
			this.selector
		);

		if ( buttons.length === 0 ) return;

		if ( ! navigator.share ) {
			return this.hideButtons( buttons );
		}

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', () =>
				this.handleShareButtonClick( button )
			);
		} );
	}

	private hideButtons( buttons: NodeListOf< HTMLButtonElement > ): void {
		buttons.forEach( ( button ) => ( button.style.display = 'none' ) );
	}

	private handleShareButtonClick( button: HTMLButtonElement ): void {
		const title = button.getAttribute( 'data-title' ) || document.title;
		const text = button.getAttribute( 'data-text' ) || document.title;
		const url = button.getAttribute( 'data-url' ) || window.location.href;

		navigator.share( { title, text, url } );
	}
}
