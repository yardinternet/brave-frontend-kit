interface FocusStyleOptions {
	bodyClass?: string;
}

export class FocusStyle {
	private readonly bodyClass;
	private isUsingKeyboard: boolean;

	constructor( options: FocusStyleOptions = {} ) {
		this.bodyClass = options.bodyClass || 'js-user-is-tabbing';
		this.isUsingKeyboard = false;
		this.init();
	}

	private init(): void {
		this.bindEvents();
	}

	private bindEvents(): void {
		document.addEventListener( 'keydown', this.handleKeyDown );
		document.addEventListener( 'mousedown', this.handleMouseDown );
	}

	private handleKeyDown = ( e: KeyboardEvent ): void => {
		if ( e.key !== 'Tab' || this.isUsingKeyboard ) return;

		this.isUsingKeyboard = true;
		document.body.classList.add( this.bodyClass );
	};

	private handleMouseDown = (): void => {
		if ( ! this.isUsingKeyboard ) return;

		this.isUsingKeyboard = false;
		document.body.classList.remove( this.bodyClass );
	};
}
