import { createFocusTrap, type FocusTrap } from 'focus-trap';
import { checkCanFocusTrap } from '@utils/focus-trap.ts';

interface SearchBarOptions {
	bodyClass?: string;
	selectorCloseButton?: string;
	selectorSearchInput?: string;
	selectorOpenButton?: string;
	selectorSearchBar?: string;
}

export class SearchBar {
	private focusTrapSearchBar: FocusTrap | null = null;
	private readonly bodyClass;
	private readonly closeButton;
	private readonly focusTrapOptions;
	private readonly openButton;
	private readonly searchBar;
	private readonly searchInput;
	private readonly selectorCloseButton;
	private readonly selectorOpenButton;
	private readonly selectorSearchBar;
	private readonly selectorSearchInput;

	constructor( options: SearchBarOptions = {} ) {
		this.bodyClass = options.bodyClass || 'js-brave-search-bar-is-open';
		this.selectorSearchBar =
			options.selectorSearchBar || '#js-brave-search-bar';
		this.selectorOpenButton =
			options.selectorOpenButton || '#js-brave-search-bar-open-btn';
		this.selectorSearchInput =
			options.selectorSearchInput || '#js-brave-search-bar-input';
		this.selectorCloseButton =
			options.selectorCloseButton || '#js-brave-search-bar-close-btn';

		this.searchBar = document.querySelector< HTMLElement >(
			this.selectorSearchBar
		);
		this.openButton = document.querySelector< HTMLButtonElement >(
			this.selectorOpenButton
		);
		this.searchInput = document.querySelector< HTMLInputElement >(
			this.selectorSearchInput
		);
		this.closeButton = document.querySelector< HTMLButtonElement >(
			this.selectorCloseButton
		);

		this.focusTrapOptions = {
			allowOutsideClick: true,
			checkCanFocusTrap,
			clickOutsideDeactivates: true,
			onActivate: (): void => {
				document.body.classList.add( this.bodyClass );
			},
			onDeactivate: (): void => {
				document.body.classList.remove( this.bodyClass );
				if ( this.searchInput ) {
					this.searchInput.value = '';
				}
			},
		};

		this.bindEvents();
	}

	private bindEvents(): void {
		if (
			! this.searchBar ||
			! this.openButton ||
			! this.searchInput ||
			! this.closeButton
		)
			return;

		this.focusTrapSearchBar = createFocusTrap(
			this.searchBar,
			this.focusTrapOptions
		);

		this.openButton.addEventListener( 'click', () => {
			this.focusTrapSearchBar?.activate();
		} );

		this.closeButton.addEventListener( 'click', () => {
			this.focusTrapSearchBar?.deactivate();
		} );
	}
}
