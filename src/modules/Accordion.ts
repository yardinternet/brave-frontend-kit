/**
 * External dependencies
 */
import AccordionJS from 'accordion-js';

export class Accordion {
	ACCORDION_CLASS = '.accordion-wrapper';
	ACCORDION_ITEM_CLASS = '.ac';
	ACCORDION_DEFAULT_OPEN_CLASS = 'is-open';
	ACCORDION_PANEL_CLASS = '.ac-panel';
	ACCORDION_HIDDEN_CLASS = 'hidden';

	constructor() {
		const accordions = this.searchForAccordions();
		if ( ! accordions ) return;

		accordions.forEach( ( accordion ) => {
			this.initSpecificAccordion( accordion );
		} );
	}

	/**
	 * Helper Functions
	 */
	searchForAccordions(): HTMLDivElement[] {
		const accordions = document.querySelectorAll< HTMLDivElement >(
			this.ACCORDION_CLASS
		);
		return Array.from( accordions );
	}

	searchWithinAccordionForItems( accordion: Element ): HTMLElement[] {
		const items = accordion.querySelectorAll< HTMLElement >(
			this.ACCORDION_ITEM_CLASS
		);
		return Array.from( items );
	}

	searchForDefaultOpenItems( items: HTMLElement[] ): number[] {
		const defaultOpenIndexes: number[] = [];
		if ( ! items || items.length === 0 ) return defaultOpenIndexes;

		items.forEach( ( item, index ) => {
			if (
				item.classList.contains( this.ACCORDION_DEFAULT_OPEN_CLASS )
			) {
				defaultOpenIndexes.push( index );
			}
		} );

		return defaultOpenIndexes;
	}

	/**
	 * Main Function : Initializes the accordion.
	 * Use the is-open class on .accordion-wrapper to define an open accordion on init.
	 */
	initSpecificAccordion( accordion: Element ): void {
		const items = this.searchWithinAccordionForItems( accordion );
		if ( ! items || items.length === 0 ) return;

		// https://github.com/michu2k/Accordion?tab=readme-ov-file#options
		const accordionOptions = {
			showMultiple:
				( accordion as HTMLElement ).dataset.multiple === 'true',
			openOnInit: this.searchForDefaultOpenItems( items ),
			ariaEnabled: true,
			duration: 400,
			beforeOpen: ( item: HTMLElement ): void => {
				item
					.querySelector( this.ACCORDION_PANEL_CLASS )
					?.classList.remove( this.ACCORDION_HIDDEN_CLASS );
			},
			onClose: ( item: HTMLElement ): void => {
				item
					.querySelector( this.ACCORDION_PANEL_CLASS )
					?.classList.add( this.ACCORDION_HIDDEN_CLASS );
			},
		};

		new AccordionJS( accordion, accordionOptions );
	}
}
