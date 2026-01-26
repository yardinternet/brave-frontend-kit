interface A11yCardsOptions {
	selector?: string;
}

export class A11yCards {
	private readonly selector;

	constructor( options: A11yCardsOptions = {} ) {
		this.selector = options.selector || '.wp-block-group.is-variation-card';
		this.init();
	}

	private init(): void {
		const cards = document.querySelectorAll< HTMLElement >( this.selector );

		if ( cards.length === 0 ) return;

		cards.forEach( this.findLinks.bind( this ) );
	}

	/**
	 * Check if the card has only one link and that link is in a button.
	 * If so, move the link to the heading for better accessibility.
	 */
	private findLinks( card: HTMLElement ): void {
		const links = card.querySelectorAll< HTMLAnchorElement >( 'a' );

		if ( links.length === 0 || links.length > 1 ) return;

		const link = links[ 0 ];
		if (
			link.getAttribute( 'href' ) &&
			link.classList.contains( 'wp-block-button__link' )
		) {
			this.a11yMoveLinkToHeading( link, card );
		}
	}

	/**
	 * A11y: If the card has a link in a button, we need to move it to the heading for better accessibility.
	 */
	private a11yMoveLinkToHeading(
		link: HTMLAnchorElement,
		card: HTMLElement
	): void {
		const heading = card.querySelector( '.wp-block-heading' );
		if ( ! heading ) return;

		if ( heading.querySelector( 'a' ) ) return;

		const newLink = document.createElement( 'a' );
		newLink.href = link.href;
		if ( link.target ) newLink.target = link.target;
		if ( link.rel ) newLink.rel = link.rel;
		newLink.innerHTML = heading.innerHTML;
		heading.innerHTML = '';
		heading.appendChild( newLink );

		this.a11yHideLink( link );
	}

	/**
	 * A11y: Hide button for screenreaders and remove tab focus because the heading already has the same link.
	 */
	private a11yHideLink( link: HTMLAnchorElement ): void {
		link.setAttribute( 'aria-hidden', 'true' );
		link.setAttribute( 'tabindex', '-1' );
	}
}
