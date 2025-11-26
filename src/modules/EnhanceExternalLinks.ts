import { EnhanceLinksBase } from '@modules/base/EnhanceLinksBase';

export class EnhanceExternalLinks extends EnhanceLinksBase {
	constructor( options = {} ) {
		super( options );
		this.init();
	}

	protected init(): void {
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
					this.insertSrOnlyText( link, ' (externe link)' );
				}
			} catch {
				// invalid URL
			}
		} );
	}

	private insertSrOnlyText( link: HTMLAnchorElement, text: string ): void {
		const srOnlyText = document.createElement( 'span' );
		srOnlyText.classList.add( 'sr-only' );
		srOnlyText.textContent = text;
		if ( this.insertIconBeforeText ) {
			link.prepend( srOnlyText );
		} else {
			link.append( srOnlyText );
		}
	}
}
