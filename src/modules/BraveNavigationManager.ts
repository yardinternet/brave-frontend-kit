import { BraveNavigation, BraveNavigationOptions } from './BraveNavigation';

export class BraveNavigationManager {
	private readonly options: BraveNavigationOptions;

	constructor( options: BraveNavigationOptions = {} ) {
		this.options = options;
		this.init();
	}

	private init(): void {
		const navigationInstances =
			document.querySelectorAll< HTMLElement >( '.brave-nav' );
		navigationInstances?.forEach(
			( nav ) => new BraveNavigation( nav, this.options )
		);
	}
}
