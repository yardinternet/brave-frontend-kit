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
		if ( e.key === 'Tab' ) {
			document.body.classList.add( this.bodyClass );
			document.removeEventListener( 'keydown', ( e ) =>
				this.handleTab( e )
			);
		}
	}

	private handleMouseDown() {
		document.body.classList.remove( this.bodyClass );
		document.addEventListener( 'keydown', ( e ) => this.handleTab( e ) );
	}
}
