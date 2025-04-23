export interface EnhanceLinksBaseOptions {
	selector?: string;
	excludedClasses?: string[];
	excludedUrlKeywords?: string[];
	icon?: string | SVGElement | null;
	insertIconBeforeText?: boolean;
}

export abstract class EnhanceLinksBase {
	protected selector: string;
	protected excludedClasses: string[];
	protected excludedUrlKeywords: string[];
	protected icon: string | SVGElement | null;
	protected insertIconBeforeText: boolean;

	constructor( options: EnhanceLinksBaseOptions = {} ) {
		this.selector = options.selector || '';
		this.excludedClasses = options.excludedClasses || [];
		this.excludedUrlKeywords = options.excludedUrlKeywords || [];
		this.icon = options.icon || null;
		this.insertIconBeforeText = options.insertIconBeforeText || false;
	}

	protected abstract init(): void;

	protected shouldIgnore(
		link: HTMLAnchorElement,
		href: string | null
	): boolean {
		if ( ! href || href === '#' || this.isRelativePath( href ) )
			return true;

		return (
			this.excludedClasses.some( ( cls ) =>
				link.classList.contains( cls )
			) || this.excludedUrlKeywords.some( ( kw ) => href.includes( kw ) )
		);
	}

	protected insertIcon( link: HTMLAnchorElement ) {
		if ( ! this.icon ) return;

		// Check if the icon is a string (HTML) or an SVG element
		if ( typeof this.icon === 'string' ) {
			const wrapper = document.createElement( 'span' );
			wrapper.innerHTML = this.icon;
			const node = wrapper.firstElementChild;

			if ( node ) {
				this.insertIconBeforeText
					? link.prepend( node )
					: link.append( node );
			}
		} else {
			this.insertIconBeforeText
				? link.prepend( this.icon.cloneNode( true ) )
				: link.append( this.icon.cloneNode( true ) );
		}
	}

	protected isRelativePath( href: string ): boolean {
		return ! href.includes( '://' );
	}
}
