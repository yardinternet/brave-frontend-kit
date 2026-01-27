/**
 * External dependencies
 */
import AccordionJS from 'accordion-js';

export class Accordion {
	private readonly WRAPPER_SELECTOR = '.accordion-wrapper';
	private readonly ITEM_SELECTOR = '.ac';
	private readonly PANEL_SELECTOR = '.ac-panel';
	private readonly DEFAULT_OPEN_CLASS = 'is-open';
	private readonly HIDDEN_CLASS = 'hidden';

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
					.querySelector( this.PANEL_SELECTOR )
					?.classList.remove( this.HIDDEN_CLASS );
			},
			onClose: ( item: HTMLElement ): void => {
				item
					.querySelector( this.PANEL_SELECTOR )
					?.classList.add( this.HIDDEN_CLASS );
			},
		};

		new AccordionJS( accordion, accordionOptions );
	}

	private getAccordionWrappers(): HTMLDivElement[] {
		const accordions = document.querySelectorAll< HTMLDivElement >(
			this.WRAPPER_SELECTOR
		);
		return Array.from( accordions );
	}

	private getAccordionItems( accordion: HTMLElement ): HTMLElement[] {
		const items = accordion.querySelectorAll< HTMLElement >(
			this.ITEM_SELECTOR
		);
		return Array.from( items );
	}

	private getDefaultOpenItemIndexes( items: HTMLElement[] ): number[] {
		return items.flatMap( ( item, index ) =>
			item.classList.contains( this.DEFAULT_OPEN_CLASS ) ? [ index ] : []
		);
	}
}
