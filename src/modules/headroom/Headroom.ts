import HeadroomJs from 'headroom.js';

interface HeadroomOptions {
	headroomOptions?: object;
	selectorHeader?: string;
}

export class Headroom {
	private readonly header;
	private readonly headroomOptions;
	private readonly selectorHeader;

	constructor( options: HeadroomOptions = {} ) {
		this.headroomOptions = options.headroomOptions || {
			tolerance: {
				up: 10,
				down: 30,
			},
		};
		this.selectorHeader = options.selectorHeader || '#js-brave-header';

		this.header = document.querySelector< HTMLElement >(
			this.selectorHeader
		);

		this.bindEvents();
	}

	private bindEvents(): void {
		if ( ! this.header ) return;

		new HeadroomJs( this.header, this.headroomOptions ).init();
	}
}
