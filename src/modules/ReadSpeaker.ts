interface ReadSpeakerOptions {
	timeout?: number;
}

export class ReadSpeaker {
	private readonly timeout;

	constructor( options: ReadSpeakerOptions = {} ) {
		this.timeout = options.timeout || 200;

		this.init();
	}

	private init(): void {
		this.moveA11yToolbarFocus();
	}

	/**
	 * Move focus to ReadSpeaker play/pause button when corresponding a11y toolbar button is clicked
	 */
	private moveA11yToolbarFocus(): void {
		const readSpeakerButton = document.querySelector(
			'.a11y-toolbar__button--readspeaker'
		);

		readSpeakerButton?.addEventListener( 'click', () => {
			setTimeout( () => {
				const readSpeakerPlayPauseButton = document.querySelector(
					'.rs-controlpanel-playpause'
				) as HTMLElement | null;

				readSpeakerPlayPauseButton?.focus();
			}, this.timeout );
		} );
	}
}
