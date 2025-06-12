import {
	EnhanceLinksBase,
	EnhanceLinksBaseOptions,
} from '@modules/base/EnhanceLinksBase';
import { formatFileSize } from '@utils/format-file-size';

interface EnhancePDFLinksOptions extends EnhanceLinksBaseOptions {
	showFileSize?: boolean;
	fileSizeClass?: string;
	createFileSizeElement?: ( sizeInBytes: number ) => HTMLElement;
}

export class EnhancePDFLinks extends EnhanceLinksBase {
	private readonly showFileSize;
	private readonly fileSizeClass;
	private readonly createFileSizeElementFn;

	constructor( options: EnhancePDFLinksOptions = {} ) {
		super( options );
		this.showFileSize = options.showFileSize ?? true;
		this.fileSizeClass =
			options.fileSizeClass || 'js-enhance-pdf-link-file-size';
		this.createFileSizeElementFn = options.createFileSizeElement;

		this.init();
	}

	protected init(): void {
		const links = document.querySelectorAll< HTMLAnchorElement >(
			this.selector
		);

		links.forEach( ( link ) => {
			const href = link.getAttribute( 'href' );

			if (
				! href ||
				! href.endsWith( '.pdf' ) ||
				this.shouldIgnore( link, href )
			)
				return;

			if ( this.showFileSize ) {
				this.appendPdfFileSize( link );
			} else {
				this.insertIcon( link );
			}
		} );
	}

	private appendPdfFileSize( link: HTMLAnchorElement ): void {
		const request = new XMLHttpRequest();
		request.open( 'HEAD', link.href, true );

		request.onreadystatechange = (): void => {
			if (
				request.readyState !== 4 ||
				request.status !== 200 ||
				request.getResponseHeader( 'Content-Type' ) !==
					'application/pdf'
			) {
				return;
			}

			const length = request.getResponseHeader( 'Content-Length' );
			if ( ! length ) return;

			const span = this.createFileSizeElement( parseInt( length, 10 ) );
			link.appendChild( span );

			this.insertIcon( link );
		};

		request.send();
	}

	private createFileSizeElement( bytes: number ): HTMLElement {
		if ( this.createFileSizeElementFn ) {
			return this.createFileSizeElementFn( bytes );
		}

		const span = document.createElement( 'span' );
		span.classList.add( ...this.fileSizeClass.split( ' ' ) );
		span.innerHTML = ` (pdf, ${ formatFileSize( bytes ) })`;
		return span;
	}
}
