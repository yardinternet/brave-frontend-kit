import { BraveNavigation } from './BraveNavigation';

const NAV_SELECTOR = '.brave-nav';

export class BraveNavigationManager {
	private navigations: BraveNavigation[] = [];

	constructor() {
		this.init();
		this.bindGlobalEvents();
	}

	private init(): void {
		const navigationContainers =
			document.querySelectorAll< HTMLElement >( NAV_SELECTOR );

		navigationContainers.forEach( ( container ) => {
			this.navigations.push( new BraveNavigation( container ) );
		} );
	}

	private bindGlobalEvents(): void {
		document.addEventListener( 'keyup', this.onKeyUp );
		document.addEventListener( 'click', this.onDocumentClick );
		document.addEventListener( 'focusin', this.onFocusIn );
	}

	private onKeyUp = ( event: KeyboardEvent ): void => {
		this.navigations.forEach( ( navigation ) => {
			navigation.onKeyUp( event );
		} );
	};

	private onDocumentClick = ( event: MouseEvent ): void => {
		this.navigations.forEach( ( navigation ) => {
			navigation.onClickDocument( event );
		} );
	};

	private onFocusIn = ( event: FocusEvent ): void => {
		this.navigations.forEach( ( navigation ) => {
			navigation.onFocusIn( event );
		} );
	};
}
