import { EnhanceLinksBase } from '@modules/base/EnhanceLinksBase';

export class EnhanceExternalLinks extends EnhanceLinksBase {
	constructor( options = {} ) {
		super( options );
		this.init();
	}

	protected init() {
		const links = document.querySelectorAll< HTMLAnchorElement >(
			this.selector
		);

		links.forEach( ( link ) => {
			const href = link.getAttribute( 'href' );

			if ( ! href || this.shouldIgnore( link, href ) ) return;

			try {
				const url = new URL( href );

				if ( url.hostname !== window.location.hostname ) {
					this.insertIcon( link );
				}
			} catch {
				// invalid URL
			}
		} );
	}
}
