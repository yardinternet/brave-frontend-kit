interface FocusStyleOptions {
	bodyClass?: string;
}

export default class FocusStyle {
	private bodyClass: string;
	private isUsingKeyboard: boolean;

	constructor( options: FocusStyleOptions = {} ) {
		this.bodyClass = options.bodyClass || 'js-user-is-tabbing';
		this.isUsingKeyboard = false;
		this.init();
	}

	private init() {
		this.bindEvents();
	}

	private bindEvents() {
		document.addEventListener( 'keydown', this.handleKeyDown );
		document.addEventListener( 'mousedown', this.handleMouseDown );
	}

	private handleKeyDown = ( e: KeyboardEvent ) => {
		if ( e.key !== 'Tab' || this.isUsingKeyboard ) return;

		this.isUsingKeyboard = true;
		document.body.classList.add( this.bodyClass );
	};

	private handleMouseDown = () => {
		if ( ! this.isUsingKeyboard ) return;

		this.isUsingKeyboard = false;
		document.body.classList.remove( this.bodyClass );
	};
}
