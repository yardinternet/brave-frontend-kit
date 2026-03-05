import { BraveNavigation } from './BraveNavigation';

export class BraveNavigationManager {
	private readonly BRAVE_NAV_SELECTOR = '.brave-nav';

	constructor() {
		this.init();
	}

	private init(): void {
		const navigationInstances = document.querySelectorAll< HTMLElement >(
			this.BRAVE_NAV_SELECTOR
		);
		navigationInstances?.forEach(
			( navigation ) => new BraveNavigation( navigation )
		);
	}
}
