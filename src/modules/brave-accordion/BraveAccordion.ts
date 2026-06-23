/**
 * External dependencies
 */
import AccordionJS from 'accordion-js';

const SELECTORS = {
	wrapper: '.accordion-wrapper',
	item: '.ac',
	panel: '.ac-panel',
} as const;

const CLASSES = {
	defaultOpen: 'is-open',
	hidden: 'hidden',
} as const;

export class BraveAccordion {
	constructor() {
		const accordions = this.getAccordionWrappers();
		if ( accordions.length === 0 ) return;

		accordions.forEach( this.initAccordion, this );
	}

	/**
	 * Main Function, Use the is-open class on .ac elements to define open accordion items on init.
	 */
	private initAccordion( accordion: HTMLElement ): void {
		const items = this.getAccordionItems( accordion );
		if ( ! items || items.length === 0 ) return;

		// https://github.com/michu2k/Accordion?tab=readme-ov-file#options
		const accordionOptions = {
			showMultiple: accordion.dataset.multiple === 'true',
			openOnInit: this.getDefaultOpenItemIndexes( items ),
			ariaEnabled: true,
			duration: 400,
			beforeOpen: ( item: HTMLElement ): void => {
				item
					.querySelector( SELECTORS.panel )
					?.classList.remove( CLASSES.hidden );
			},
			onClose: ( item: HTMLElement ): void => {
				item
					.querySelector( SELECTORS.panel )
					?.classList.add( CLASSES.hidden );
			},
		};

		new AccordionJS( accordion, accordionOptions );
	}

	private getAccordionWrappers(): HTMLDivElement[] {
		const accordions = document.querySelectorAll< HTMLDivElement >(
			SELECTORS.wrapper
		);
		return Array.from( accordions );
	}

	private getAccordionItems( accordion: HTMLElement ): HTMLElement[] {
		const items = accordion.querySelectorAll< HTMLElement >(
			SELECTORS.item
		);
		return Array.from( items );
	}

	private getDefaultOpenItemIndexes( items: HTMLElement[] ): number[] {
		return items.flatMap( ( item, index ) =>
			item.classList.contains( CLASSES.defaultOpen ) ? [ index ] : []
		);
	}
}
