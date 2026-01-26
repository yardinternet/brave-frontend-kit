declare module 'accordion-js' {
	interface AccordionOptions {
		duration?: number;
		ariaEnabled?: boolean;
		collapse?: boolean;
		showMultiple?: boolean;
		onlyChildNodes?: boolean;
		openOnInit?: number[];
		elementClass?: string;
		triggerClass?: string;
		panelClass?: string;
		activeClass?: string;
		beforeOpen?: ( item: HTMLElement ) => void;
		onOpen?: ( item: HTMLElement ) => void;
		beforeClose?: ( item: HTMLElement ) => void;
		onClose?: ( item: HTMLElement ) => void;
	}

	class AccordionJS {
		constructor( element: Element | string, options?: AccordionOptions );
		attachEvents(): void;
		detachEvents(): void;
		toggle( index: number ): void;
		open( index: number ): void;
		openAll(): void;
		close( index: number ): void;
		closeAll(): void;
		destroy(): void;
		update(): void;
	}

	export default AccordionJS;
}
