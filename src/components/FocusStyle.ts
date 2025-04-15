interface FocusStyleOptions {
	bodyClass?: string;
}

export default class FocusStyle {
	private bodyClass: string;

	constructor( options: FocusStyleOptions = {} ) {
		this.bodyClass = options.bodyClass || 'js-user-is-tabbing';
		this.init();
	}

	private init() {
		this.bindEvents();
	}

	private bindEvents() {
		document.addEventListener( 'keydown', ( e ) => this.handleTab( e ) );
		document.addEventListener( 'mousedown', () => this.handleMouseDown() );
	}

	private handleTab( e: KeyboardEvent ) {
		if ( e.key !== 'Tab' ) return;

		document.body.classList.add( this.bodyClass );
		document.removeEventListener( 'keydown', this.handleTab );
	}

	private handleMouseDown() {
		document.body.classList.remove( this.bodyClass );
		window.removeEventListener( 'mousedown', this.handleMouseDown );
	}
}
